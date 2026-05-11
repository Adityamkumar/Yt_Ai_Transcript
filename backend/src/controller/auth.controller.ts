import userModel from "../models/user.model.js";
import { refreshCookieOptions, accessCookieOptions } from "../config/cookie.config.js";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateAccessTokenAndRefreshToken } from "../services/auth.service.js";
import type { CustomJwtPayload } from "../types/jwt.types.js";



export const userRegister = asyncHandler(async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const isUserAlreadyExists = await userModel.findOne({ email });

    if (isUserAlreadyExists) {
      return res.status(400).json({
        message: "User already exists!",
      });
    }

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }
    if (typeof password != "string") {
      return res.status(400).json({
        message: "Password must be a string",
      });
    }

    const user = await userModel.create({
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
    return res.status(500).json({ message: "Internal server error!" });
  }
}
);


export const userLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password!",
      });
    }
    const isPasswordMatched = await user.isPasswordCorrect(password);

    if (!isPasswordMatched) {
      return res.status(400).json({
        message: "Invalid email or password!",
      });
    }

    const { accessToken, refreshToken } =
      await generateAccessTokenAndRefreshToken(user._id);

    const loggedInUser = await userModel
      .findById(user._id)
      .select("-password -refreshToken");

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
    return res.status(500).json({
      message: "Internal server error",
    });
  }
})

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    return res.status(401).json({
      message: "Unauthorized request",
    });
  }

    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    ) as CustomJwtPayload;

    const user = await userModel.findById(decodedToken._id);

    if (!user) {
      return res.status(401).json({
        message: "Invalid refreshToken",
      });
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      return res
        .status(401)
        .json({ message: "Refresh token is used or expired" });
    }

    const { accessToken, refreshToken } =
      await generateAccessTokenAndRefreshToken(user._id);

    res.cookie("accessToken", accessToken, accessCookieOptions);
    res.cookie("refreshToken", refreshToken, refreshCookieOptions);

    return res.status(200).json({
      accessToken,
      refreshToken: refreshToken,
      message: "access token refreshed",
    });
})

export const userLogout = asyncHandler(async (req, res) => {
  await userModel.findByIdAndUpdate(
    req.user?._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    },
  );

  res
    .status(200)
    .clearCookie("accessToken", accessCookieOptions)
    .clearCookie("refreshToken", refreshCookieOptions)
    .json({
       message: "user logged out successfully"
    })
})

export const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(200).json({
    user: {
      id: req.user?._id,
      name: req.user?.name,
      email: req.user?.email,
    },
  });
})