import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { CustomJwtPayload } from "../types/jwt.types.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import User from "../models/user.model.js";

export const authIdentityMiddleware = asyncHandler(
  async (req: Request, _, next: NextFunction) => {
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
        process.env.ACCESS_TOKEN_SECRET!,
      ) as CustomJwtPayload;
    } catch (error) {
      throw new ApiError(
        401,
        error instanceof jwt.TokenExpiredError
          ? "Token expired"
          : "Invalid token",
        [],
        "",
        "AUTHENTICATION_REQUIRED",
      );
    }

    if (!decoded._id || !decoded.sessionId) {
      throw new ApiError(
        401,
        "Invalid token",
        [],
        "",
        "AUTHENTICATION_REQUIRED",
      );
    }

    req.authUserId = String(decoded._id);
    req.authSessionId = String(decoded.sessionId);

    next();
  },
);

export const requireVerifiedEmail = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.authUserId) {
      throw new ApiError(
        401,
        "Authentication required",
        [],
        "",
        "AUTHENTICATION_REQUIRED",
      );
    }

    const user = await User.findById(req.authUserId)
      .select("_id isEmailVerified")
      .lean();

    if (!user) {
      throw new ApiError(
        401,
        "Authentication required",
        [],
        "",
        "AUTHENTICATION_REQUIRED",
      );
    }

    if (!user.isEmailVerified) {
      throw new ApiError(
        403,
        "Email verification required",
        [],
        "",
        "EMAIL_NOT_VERIFIED",
      );
    }

    next();
  },
);
