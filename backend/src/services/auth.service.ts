import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";

export const generateAccessTokenAndRefreshToken = async (userId: any, oldRefreshToken?: string) => {
  try {
    const user = await User.findById(userId);
     if (!user) {
      throw new ApiError(404,"User not found");
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    let currentTokens = Array.isArray(user.refreshToken)
      ? user.refreshToken
      : (user.refreshToken ? [user.refreshToken as string] : []);

    if (oldRefreshToken) {
      currentTokens = currentTokens.filter((token) => token !== oldRefreshToken);
    }

    currentTokens.push(refreshToken);

    if (currentTokens.length > 5) {
      currentTokens.shift();
    }

    user.refreshToken = currentTokens;

    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw error
  }
};
