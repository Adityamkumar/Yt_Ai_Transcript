import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { CustomJwtPayload } from "../types/jwt.types.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";

export const authMiddleware = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(
        401,
        "Authentication required",
        [],
        "",
        "AUTHENTICATION_REQUIRED",
      );
    }

    let decoded: CustomJwtPayload;
    try {
      decoded = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
      ) as CustomJwtPayload;
    } catch (error) {
      throw new ApiError(
        401,
        error instanceof jwt.TokenExpiredError ? "Token expired" : "Invalid token",
        [],
        "",
        "AUTHENTICATION_REQUIRED",
      );
    }

    const user = await User.findById(decoded._id).select("-password");

    if (!user) {
      throw new ApiError(
        401,
        "Authentication required",
        [],
        "",
        "AUTHENTICATION_REQUIRED",
      );
    }

    req.user = user;
    req.authUserId = String(user._id);
    next();
  },
);
