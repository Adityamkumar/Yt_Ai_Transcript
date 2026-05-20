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
        user: loggedInUser,
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

  if (incomingRefreshToken !== user?.refreshToken) {
    throw new ApiError(401, "Refresh token is used or expired");
  }

  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(user._id);

  res.cookie("accessToken", accessToken, accessCookieOptions);
  res.cookie("refreshToken", refreshToken, refreshCookieOptions);

  res.status(200).json({
    message: "access token refreshed",
    accessToken,
    refreshToken,
  });
});

export const userLogout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      returnDocument: "after",
    },
  );

  res
    .status(200)
    .clearCookie("accessToken", accessCookieOptions)
    .clearCookie("refreshToken", refreshCookieOptions)
    .json({
      message: "user logged out successfully",
    });
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(200).json({
    user: {
      id: req.user?._id,
      name: req.user?.name,
      email: req.user?.email,
    },
  });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const userId = req.params.id;   
    const { password } = req.body;

  if (userId !== req.user?._id.toString()) {
     throw new ApiError(403, "Forbidden: You can only delete your own account");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const isPasswordMatched = await user.isPasswordCorrect(password);
  if (!isPasswordMatched) {
    throw new ApiError(400, "Invalid password");
  }

  await User.findByIdAndDelete(userId);
  
  res
  .status(200)
  .clearCookie("accessToken", accessCookieOptions)
  .clearCookie("refreshToken", refreshCookieOptions)
  .json(new ApiResponse(200, "User deleted successfully"));
}
);
