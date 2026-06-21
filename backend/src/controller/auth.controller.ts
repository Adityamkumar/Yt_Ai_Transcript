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

export const userRegister = asyncHandler(async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name) {
      throw new ApiError(400, "Name is required");
    }

    const isUserAlreadyExists = await User.findOne({ email });

    if (isUserAlreadyExists) {
      throw new ApiError(400, "User already exists with this email");
    }

    if (!password) {
      throw new ApiError(400, "Password is required");
    }
    if (typeof password != "string") {
      throw new ApiError(400, "Password must be a string");
    }

    const user = await User.create({
      name,
      email: email,
      password: password,
    });

    const { accessToken, refreshToken } =
      await generateAccessTokenAndRefreshToken(user._id);

    res.cookie("accessToken", accessToken, accessCookieOptions);
    res.cookie("refreshToken", refreshToken, refreshCookieOptions);

    res.status(201).json({
      message: "User register successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        hasPassword: true,
      },
    });
  } catch (error) {
    throw new ApiError(500, "Internal server error!");
  }
});

export const userLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      throw new ApiError(400, "Invalid email or password!");
    }
    const isPasswordMatched = await user.isPasswordCorrect(password);

    if (!isPasswordMatched) {
      throw new ApiError(400, "Invalid email or password!");
    }

    const { accessToken, refreshToken } =
      await generateAccessTokenAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken",
    );

    res.cookie("accessToken", accessToken, accessCookieOptions);
    res.cookie("refreshToken", refreshToken, refreshCookieOptions);

    res.status(200).json({
      message: "User Logged In successfully",
      user: {
        user: { ...loggedInUser!.toObject(), hasPassword: !!user.password },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    throw new ApiError(500, "Internal server error");
  }
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

  const user = await User.findById(decodedToken._id);

  if (!user) {
    throw new ApiError(401, "Invalid refreshToken");
  }

  const currentTokens = Array.isArray(user.refreshToken)
    ? user.refreshToken
    : user.refreshToken
      ? [user.refreshToken as string]
      : [];

  if (!currentTokens.includes(incomingRefreshToken)) {
    throw new ApiError(401, "Refresh token is used or expired");
  }

  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(user._id, incomingRefreshToken);

  res.cookie("accessToken", accessToken, accessCookieOptions);
  res.cookie("refreshToken", refreshToken, refreshCookieOptions);

  res.status(200).json({
    message: "access token refreshed",
    accessToken,
    refreshToken,
  });
});

export const userLogout = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken;

  if (incomingRefreshToken) {
    await User.findByIdAndUpdate((req.user as any)?._id, {
      $pull: {
        refreshToken: incomingRefreshToken,
      },
    });
  } else {
    await User.findByIdAndUpdate((req.user as any)?._id, {
      $unset: {
        refreshToken: 1,
      },
    });
  }

  res
    .status(200)
    .clearCookie("accessToken", accessCookieOptions)
    .clearCookie("refreshToken", refreshCookieOptions)
    .json({
      message: "user logged out successfully",
    });
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  const userId = (req.user as any)?._id;
  const userWithPassword = await User.findById(userId).select("password");

  return res.status(200).json({
    user: {
      id: userId,
      name: (req.user as any)?.name,
      email: (req.user as any)?.email,
      avatar: (req.user as any)?.avatar,
      provider: (req.user as any)?.provider,
      hasPassword: !!userWithPassword?.password,
    },
  });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const { password } = req.body;

  if (userId !== String((req.user as any)?._id)) {
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

  await User.findByIdAndDelete(userId);

  res
    .status(200)
    .clearCookie("accessToken", accessCookieOptions)
    .clearCookie("refreshToken", refreshCookieOptions)
    .json(new ApiResponse(200, "Account deleted successfully"));
});

export const googleCallbackController = asyncHandler(async (req, res) => {
  const profile: any = req.user;
  const googleId = profile.id;
  const name = profile.displayName;
  const email = profile.emails?.[0]?.value;
  const avatar = profile.photos?.[0]?.value;
  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      name,
      email,
      avatar,
      googleId,
      provider: "google",
    });
  }
  if (user.provider === "local" && !user.googleId) {
    user.googleId = googleId;

    user.avatar = avatar;

    user.provider = "google";

    await user.save();
  }

  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(user._id);

  res.cookie("accessToken", accessToken, accessCookieOptions);
  res.cookie("refreshToken", refreshToken, refreshCookieOptions);

  const frontendUrl = process.env.NODE_ENV === "production"
    ? (process.env.FRONTEND_PROD_URL || "https://echomindai63.vercel.app")
    : "http://localhost:5173";

  return res.redirect(`${frontendUrl}/app`);
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

export const forgetPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const user = await User.findOne({ email: email });
  if (!user) {
    throw new ApiError(404, "Couldn't find the user with this email");
  }

  if (!user.password) {
    return res.status(400).json({
      success: false,
      message: "This account uses Google Sign-In.",
    });
  }

  const resetToken = user.generateResetPasswordToken();
  await user.save({
    validateBeforeSave: false,
  });

  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const resetLink = `${clientUrl}/reset-password/${resetToken}`;
  const template = generateResetPasswordEmail(resetLink, user.name);

  await sendEmail({
    to: user.email,
    subject: template.subject,
    html: template.html,
  });
  res
    .status(200)
    .json(new ApiResponse(200, "Reset password link sent successfully."));
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
    throw new ApiError(400, "Invalid or expired reset token");
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
