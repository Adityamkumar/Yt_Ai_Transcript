import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";

export const generateAccessTokenAndRefreshToken = async (userId: string, sessionId:string) => {

    const user = await User.findById(userId);
     if (!user) {
      throw new ApiError(404,"User not found");
    }
    const accessToken = user.generateAccessToken(sessionId);
    const refreshToken = user.generateRefreshToken();

    return { accessToken, refreshToken };
  };
