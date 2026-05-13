import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";

export const generateAccessTokenAndRefreshToken = async (userId: any) => {
  try {
    const user = await User.findById(userId);
     if (!user) {
      throw new ApiError(404,"User not found");
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw error
  }
};