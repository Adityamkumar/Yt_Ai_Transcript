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
     throw new ApiError(401, "Unauthorized access")
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
      ) as CustomJwtPayload;
  
      const user = await User.findById(decoded._id).select("-password");
  
      if (!user) {
        throw new ApiError(401, "Invalid token")
      }
  
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        message: error instanceof jwt.TokenExpiredError ? "Token expired" : "Invalid token",
      });
    }
  },
);

