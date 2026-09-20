import User from "../models/user.model.js";
import {
  refreshCookieOptions,
  accessCookieOptions,
} from "../config/cookie.config.js";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateAccessTokenAndRefreshToken } from "../services/auth.service.js";
import type { CustomJwtPayload } from "../types/jwt.types.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from "node:crypto";
import { generateResetPasswordEmail } from "../utils/emailTemplates.js";
import { googleClient } from "../config/googleAuth.js";
import { authRateLimiterService } from "../services/authRateLimiter.service.js";
import logger from "../lib/logger.js";
import { userEvent } from "../events/user.events.js";
import { cleanupUserData } from "../rag/services/accountCleanup.service.js";
import { authRequestRateLimiterService } from "../services/authRequestRateLimiter.service.js";
import { signupRateLimiterService } from "../services/signupRateLimiter.service.js";
import { normalizeEmail } from "../utils/email.util.js";
import { checkEmailDomain } from "../services/disposable-email.service.js";
import { hashRefreshToken } from "../utils/token.utils.js";
import Session from "../models/session.model.js";
import mongoose from "mongoose";
import {
  createSessionManagementChallenge,
  getValidSessionManagementChallenge,
} from "../services/session-management.service.js";

export const userRegister = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const ip = req.ip || req.socket.remoteAddress || "";
  const userAgent = req.get("user-agent") || "";

  const normalizedEmail = normalizeEmail(email);
  const domainCheck = checkEmailDomain(normalizedEmail);

  if (domainCheck.status === "reject") {
    throw new ApiError(400, "Please use a permanent email address.");
  }

  if (signupRateLimiterService.isFailedAttemptBlocked(ip)) {
    const retryAfter = signupRateLimiterService.getFailedRetryAfter(ip);

    return res
      .status(429)
      .json(
        new ApiResponse(
          429,
          retryAfter,
          "Too many failed signup attempts. Please try again in 10 minutes.",
        ),
      );
  }

  if (signupRateLimiterService.isSuccessfulSignupBlocked(ip)) {
    const retryAfter = signupRateLimiterService.getSuccessfulRetryAfter(ip);

    return res
      .status(429)
      .json(
        new ApiResponse(
          429,
          retryAfter,
          "Too many accounts created. Please try again in 1 hour.",
        ),
      );
  }

  if (!name || !email.toLowerCase()) {
    signupRateLimiterService.recordFailedAttempt(ip);
    throw new ApiError(400, "Name and Email is required");
  }

  const isUserAlreadyExists = await User.findOne({ email: email });

  if (isUserAlreadyExists) {
    signupRateLimiterService.recordFailedAttempt(ip);
    throw new ApiError(400, "User already exists with this email.");
  }

  if (!password || typeof password !== "string") {
    signupRateLimiterService.recordFailedAttempt(ip);
    throw new ApiError(400, "Password is required and must be a string");
  }

  const user = new User({
    name,
    email: normalizedEmail,
    password: password,
    isEmailVerified: false,
    verificationExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;

  await user.save({ validateBeforeSave: false });

  signupRateLimiterService.recordSuccessfulSignup(ip);

  const session = new Session({
    user: user._id,
    userAgent,
    ipAddress: ip,
    provider: "local",
    expiresAt: new Date(Date.now() + Number(process.env.REFRESH_TOKEN_EXPIRY)),
  });

  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(
      user._id.toString(),
      session._id.toString(),
    );
  session.refreshTokenHash = hashRefreshToken(refreshToken);

  res.cookie("accessToken", accessToken, accessCookieOptions);
  res.cookie("refreshToken", refreshToken, refreshCookieOptions);

  userEvent.emit("user.verification.requested", {
    userId: user._id,
    name: user.name,
    email: user.email,
    verificationToken: unHashedToken,
  });

  res.status(201).json({
    message: "User register successfully",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      hasPassword: true,
    },
  });
});

export const userLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const ip = req.ip || req.socket.remoteAddress || "";
  const userAgent = req.get("user-agent") || "";

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email.trim() ||
    !password.trim()
  ) {
    throw new ApiError(400, "Invalid email or password");
  }

  const user = await User.findOne({ email });

  if (!user || !user.password) {
    authRateLimiterService.recordFailure(ip, "login");
    if (authRateLimiterService.isBlocked(ip, "login")) {
      const retryAfter = authRateLimiterService.getRetryAfter(ip, "login");
      return res.status(429).json({
        success: false,
        message: "Too many failed login attempts. Please try again later.",
        retryAfter,
      });
    }
    throw new ApiError(401, "Invalid email or password");
  }

  const isPasswordMatched = await user.isPasswordCorrect(password);

  if (!isPasswordMatched) {
    authRateLimiterService.recordFailure(ip, "login");
    if (authRateLimiterService.isBlocked(ip, "login")) {
      const retryAfter = authRateLimiterService.getRetryAfter(ip, "login");
      return res.status(429).json({
        success: false,
        message: "Too many failed login attempts. Please try again later.",
        retryAfter,
      });
    }
    throw new ApiError(401, "Invalid email or password");
  }

  const activeSessionCount = await Session.countDocuments({
    user: user._id,
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  });

  if (activeSessionCount >= 3) {
    const managementToken = await createSessionManagementChallenge(
      user._id.toString(),
    );

    const sessions = await Session.find({
      user: user._id,
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    })
      .select("_id userAgent provider createdAt expiresAt")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(409).json({
      success: false,
      statusCode: 409,
      code: "MAX_SESSIONS_REACHED",
      message: "Maximum of 3 active sessions reached.",
      data: {
        sessionManagementToken: managementToken,
        sessions,
      },
    });
  }

  const session = new Session({
    user: user._id,
    userAgent,
    ipAddress: ip,
    provider: "local",
    expiresAt: new Date(Date.now() + Number(process.env.REFRESH_TOKEN_EXPIRY)),
  });

  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(
      user._id.toString(),
      session._id.toString(),
    );

  session.refreshTokenHash = hashRefreshToken(refreshToken);

  await session.save();
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  // Reset rate limiter on successful login
  authRateLimiterService.reset(ip, "login");

  res.cookie("accessToken", accessToken, accessCookieOptions);
  res.cookie("refreshToken", refreshToken, refreshCookieOptions);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        user: { ...loggedInUser!.toObject(), hasPassword: !!user.password },
        accessToken,
      },
      "User Logged In successfully",
    ),
  );
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  let decodedToken = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET,
  ) as CustomJwtPayload;

  const refreshTokenHash = hashRefreshToken(incomingRefreshToken);

  const session = await Session.findOne({
    user: decodedToken._id,
    refreshTokenHash,
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  });

  if (!session) {
    throw new ApiError(401, "Refresh token is invalid or expired");
  }

  const user = await User.findById(decodedToken._id);

  if (!user) {
    throw new ApiError(401, "Invalid refreshToken");
  }

  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(
      user._id.toString(),
      session._id.toString(),
    );

  session.refreshTokenHash = hashRefreshToken(refreshToken);
  await session.save();
  res.cookie("accessToken", accessToken, accessCookieOptions);
  res.cookie("refreshToken", refreshToken, refreshCookieOptions);

  res.status(200).json({
    message: "access token refreshed",
    accessToken,
  });
});

export const userLogout = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken;
  if (incomingRefreshToken) {
    const refreshTokenHash = hashRefreshToken(incomingRefreshToken);
    await Session.findOneAndUpdate(
      {
        user: req.authUserId,
        refreshTokenHash,
        revokedAt: null,
      },
      {
        $set: {
          revokedAt: new Date(),
        },
      },
    );
  }

  res
    .status(200)
    .clearCookie("accessToken", accessCookieOptions)
    .clearCookie("refreshToken", refreshCookieOptions)
    .json({
      message: "user logged out successfully",
    });
});

export const logoutAllDevices = asyncHandler(async (req, res) => {
  await Session.updateMany(
    {
      user: req.authUserId,
      revokedAt: null,
    },
    {
      $set: {
        revokedAt: new Date(),
      },
    },
  );

  res
    .status(200)
    .clearCookie("accessToken", accessCookieOptions)
    .clearCookie("refreshToken", refreshCookieOptions)
    .json({
      message: "Logged out from all devices successfully",
    });
});

export const getActiveSessions = asyncHandler(async (req, res) => {
  const sessions = await Session.find({
    user: req.authUserId,
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  })
    .select("_id userAgent provider createdAt expiresAt")
    .sort({ createdAt: -1 })
    .lean();

  const sessionsWithCurrent = sessions.map((session) => ({
    ...session,
    isCurrent: session._id.toString() === req.authSessionId,
  }));

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { sessions: sessionsWithCurrent },
        "Active sessions fetched successfully",
      ),
    );
});

export const logoutSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  if (!mongoose.isValidObjectId(sessionId) || !sessionId) {
    throw new ApiError(400, "Invalid session ID");
  }

  const session = await Session.findOneAndUpdate(
    {
      _id: sessionId,
      user: req.authUserId,
      revokedAt: null,
    },
    {
      $set: {
        revokedAt: new Date(),
      },
    },
    {
      new: true,
    },
  );

  if (!session) {
    throw new ApiError(404, "Session not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Session logged out successfully"));
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  const userId = (req.user as any)?._id;
  const userWithPassword = await User.findById(userId).select("password");

  return res.status(200).json({
    user: {
      id: userId,
      name: req.user?.name,
      email: req.user?.email,
      avatar: req.user?.avatar,
      provider: req.user?.provider,
      isEmailVerified: req.user?.isEmailVerified,
      hasPassword: !!userWithPassword?.password,
    },
  });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const { password } = req.body;

  if (userId !== String(req.authUserId)) {
    throw new ApiError(403, "Forbidden: You can only delete your own account");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.password) {
    const isPasswordMatched = await user.isPasswordCorrect(password);
    if (!isPasswordMatched) {
      throw new ApiError(400, "Invalid password");
    }
  }

  await cleanupUserData(user._id);
  await User.findByIdAndDelete(userId);

  res
    .status(200)
    .clearCookie("accessToken", accessCookieOptions)
    .clearCookie("refreshToken", refreshCookieOptions)
    .json(new ApiResponse(200, "Account deleted successfully"));
});

export const googleVerifyController = asyncHandler(async (req, res) => {
  const { code } = req.body;

  const ip = req.ip || req.socket.remoteAddress || "";
  const userAgent = req.get("user-agent") || "";

  if (!code) {
    throw new ApiError(400, "Authorization code is required");
  }

  const { tokens } = await googleClient.getToken(code);

  if (!tokens.id_token) {
    throw new ApiError(400, "Failed to retrieve id_token from Google");
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: tokens.id_token,
    audience: process.env.GOOGLE_CLIENT_ID!,
  });

  const payload = ticket.getPayload();
  if (!payload) {
    throw new ApiError(400, "Failed to verify ID token payload");
  }

  const googleId = payload.sub;
  const name = payload.name;
  const email = payload.email;
  const avatar = payload.picture;

  if (!email || !payload.email_verified) {
    throw new ApiError(400, "Google account does not have an email address");
  }

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      name: name || "",
      email,
      avatar: avatar || "",
      googleId,
      provider: "google",
    });

    userEvent.emit("user.created", {
      userId: user._id,
      name: user.name,
      email: user.email,
    });
  } else {
    if (user.googleId && user.googleId !== googleId) {
      throw new ApiError(
        401,
        "This email is linked to a different Google account",
      );
    }
  }

  if (user.provider === "local" && !user.googleId) {
    user.googleId = googleId;
    if (avatar) {
      user.avatar = avatar;
    }
    await user.save();
  }

  const activeSessionCount = await Session.countDocuments({
    user: user._id,
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  });

  if (activeSessionCount >= 3) {
    const managementToken = await createSessionManagementChallenge(
      user._id.toString(),
    );

    const sessions = await Session.find({
      user: user._id,
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    })
      .select("_id userAgent provider createdAt expiresAt")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(409).json({
      success: false,
      statusCode: 409,
      code: "MAX_SESSIONS_REACHED",
      message: "Maximum of 3 active sessions reached.",
      data: {
        sessionManagementToken: managementToken,
        sessions,
      },
    });
  }

  const session = new Session({
    user: user._id,
    userAgent,
    ipAddress: ip,
    provider: "google",
    expiresAt: new Date(Date.now() + Number(process.env.REFRESH_TOKEN_EXPIRY)),
  });

  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(
      user._id.toString(),
      session._id.toString(),
    );

  const refreshTokenHash = hashRefreshToken(refreshToken);

  session.refreshTokenHash = refreshTokenHash;
  await session.save();

  res.cookie("accessToken", accessToken, accessCookieOptions);
  res.cookie("refreshToken", refreshToken, refreshCookieOptions);

  return res.status(200).json({
    user: {
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      provider: user.provider,
      hasPassword: !!user.password,
    },
  });
});

export const avatarProxyController = asyncHandler(async (req, res) => {
  const { url } = req.query;

  if (!url || typeof url !== "string") {
    throw new ApiError(400, "Invalid image URL");
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new ApiError(502, "Failed to fetch image");
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const buffer = await response.arrayBuffer();

    res.set("Content-Type", contentType);
    res.set("Cache-Control", "public, max-age=86400");
    res.send(Buffer.from(buffer));
  } catch (error) {
    throw new ApiError(502, "Failed to proxy image");
  }
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const ip = req.ip || req.socket.remoteAddress || "";
  const normalizedEmail = email.trim().toLowerCase();

  if (authRequestRateLimiterService.isBlocked(ip, "forgotPassword")) {
    const retryAfter = authRequestRateLimiterService.getRetryAfter(
      ip,
      "forgotPassword",
    );

    return res
      .status(429)
      .json(
        new ApiResponse(
          429,
          retryAfter,
          "Too many password reset attempts. Please try again in 1 hour.",
        ),
      );
  }

  if (
    authRequestRateLimiterService.isBlocked(normalizedEmail, "forgotPassword")
  ) {
    const retryAfter = authRequestRateLimiterService.getRetryAfter(
      normalizedEmail,
      "forgotPassword",
    );

    return res
      .status(429)
      .json(
        new ApiResponse(
          429,
          retryAfter,
          "Too many password reset attempts. Please try again in 1 hour.",
        ),
      );
  }

  authRequestRateLimiterService.recordRequest(ip, "forgotPassword");

  authRequestRateLimiterService.recordRequest(
    normalizedEmail,
    "forgotPassword",
  );

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    return res
      .status(200)
      .json(new ApiResponse(200, "If eligible, we'll send a reset link"));
  }

  if (!user.password) {
    return res
      .status(400)
      .json(new ApiResponse(400, "This account uses Google Sign-In."));
  }

  const resetToken = user.generateResetPasswordToken();
  await user.save({
    validateBeforeSave: false,
  });

  const clientUrl =
    process.env.NODE_ENV === "production"
      ? process.env.FRONTEND_CLOUDFLARE_URL
      : "http://localhost:5173";
  const resetLink = `${clientUrl}/reset-password/${resetToken}`;
  const template = generateResetPasswordEmail(resetLink, user.name);

  await sendEmail({
    to: user.email,
    subject: template.subject,
    html: template.html,
  });

  res
    .status(200)
    .json(new ApiResponse(200, "If eligible, we'll send a reset link"));
});

export const resetPasswordController = asyncHandler(async (req, res) => {
  const rawToken = req.params.token;
  const token = typeof rawToken === "string" ? rawToken : "";

  const { password } = req.body;

  if (!token) {
    throw new ApiError(400, "Reset token is required");
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpiry: {
      $gt: new Date(),
    },
  });

  if (!user) {
    throw new ApiError(489, "Invalid or expired reset token");
  }

  if (!password || typeof password !== "string") {
    throw new ApiError(400, "Password is required");
  }

  user.password = password;
  await user.save();
  await User.findByIdAndUpdate(user._id, {
    $unset: {
      resetPasswordToken: 1,
      resetPasswordExpiry: 1,
    },
  });

  return res.status(200).json({
    success: true,
    message: "Password reset successfully",
  });
});

export const validateResetPasswordTokenController = asyncHandler(
  async (req, res) => {
    const rawToken = req.params.token;
    const token = typeof rawToken === "string" ? rawToken : "";

    if (!token) {
      throw new ApiError(400, "Reset token is required");
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpiry: { $gt: new Date() },
    }).select("_id");

    if (!user) {
      throw new ApiError(400, "Invalid or expired reset token");
    }

    return res.status(200).json(new ApiResponse(200, "Reset token is valid"));
  },
);

export const verifyEmail = asyncHandler(async (req, res) => {
  const { verificationToken } = req.params;
  if (typeof verificationToken !== "string" || !verificationToken) {
    throw new ApiError(400, "Email verification token is missing");
  }

  const hashedToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpiry: {
      $gt: new Date(),
    },
  });

  if (!user) {
    throw new ApiError(400, "Token is invalid or expired");
  }

  user.emailVerificationToken = undefined;
  user.emailVerificationExpiry = undefined;
  user.isEmailVerified = true;

  await user.save({
    validateBeforeSave: false,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        isEmailVerified: true,
      },
      "Email verified successfully",
    ),
  );
});

export const resendEmailVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email || typeof email !== "string") {
    throw new ApiError(400, "Email is required");
  }

  const normalizedEmail = normalizeEmail(email);

  const ip = req.ip || req.socket.remoteAddress || "";

  const ipRateLimit = authRequestRateLimiterService.getRateLimitStatus(
    ip,
    "emailVerification",
  );

  if (ipRateLimit.blocked) {
    const message =
      ipRateLimit.reason === "cooldown"
        ? "Please wait before requesting another verification email."
        : "Too many Email verification attempts. Please try again in 1 hour.";

    return res.status(429).json(
      new ApiResponse(
        429,
        {
          retryAfter: ipRateLimit.retryAfter,
          reason: ipRateLimit.reason,
        },
        message,
      ),
    );
  }

  const emailRateLimit = authRequestRateLimiterService.getRateLimitStatus(
    normalizedEmail,
    "emailVerification",
  );

  if (emailRateLimit.blocked) {
    const message =
      emailRateLimit.reason === "cooldown"
        ? "Please wait before requesting another verification email."
        : "Too many Email verification attempts. Please try again in 1 hour.";

    return res.status(429).json(
      new ApiResponse(
        429,
        {
          retryAfter: emailRateLimit.retryAfter,
          reason: emailRateLimit.reason,
        },
        message,
      ),
    );
  }

  const user = await User.findOne({
    email: normalizedEmail,
  });

  if (!user) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          {},
          "If the request can be processed, a verification email will be sent.",
        ),
      );
  }

  if (user.isEmailVerified) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          {},
          "If the request can be processed, a verification email will be sent.",
        ),
      );
  }

  const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  user.emailVerificationToken = hashedToken;

  user.emailVerificationExpiry = tokenExpiry;

  await user.save({
    validateBeforeSave: false,
  });

  authRequestRateLimiterService.recordRequest(ip, "emailVerification");

  authRequestRateLimiterService.recordRequest(
    normalizedEmail,
    "emailVerification",
  );

  userEvent.emit("user.verification.requested", {
    userId: user._id,
    name: user.name,
    email: user.email,
    verificationToken: unHashedToken,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "If the request can be processed, a verification email will be sent.",
      ),
    );
});

export const logoutSessionWithChallenge = asyncHandler(async (req, res) => {
  const managementToken = req.get("X-Session-Management-Token");

  const challenge = await getValidSessionManagementChallenge(managementToken);

  const { sessionId } = req.params;
  if (!mongoose.isValidObjectId(sessionId) || !sessionId) {
    throw new ApiError(400, "Invalid sessionId");
  }

  const session = await Session.findOneAndUpdate(
    {
      _id: sessionId,
      user: challenge.user,
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    },
    {
      $set: {
        revokedAt: new Date(),
      },
    },
    {
      new: true,
    },
  );

  if (!session) {
    throw new ApiError(404, "Session not found or is no longer active");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Session logged out successfully"));
});
