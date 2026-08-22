import User from "../../models/user.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const updatePreferences = asyncHandler(async (req, res) => {
  const userId = req.authUserId
  const { responseLanguage } = req.body;

  if (!responseLanguage) {
    throw new ApiError(400, "Response language is required");
  }

  const allowedLanguages = ["en", "hi", "ta", "te", "kn", "ml", "bn", "mr"];

  if (!allowedLanguages.includes(responseLanguage)) {
    throw new ApiError(400, "Invalid response language");
  }

  const user = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        "preferences.responseLanguage": responseLanguage,
      },
    },
    {
      returnDocument: "after",
      runValidators: true,
    },
  ).select("preferences");


  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { preferences: user.preferences },
        "Response language updated successfully",
      ),
    );
});
