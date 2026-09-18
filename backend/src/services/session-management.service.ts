import sessionManagementChallengeModel from "../models/sessionManagementChallenge.model.js";
import { ApiError } from "../utils/ApiError.js";
import {
  generateSessionManagementToken,
  hashSessionManagementToken,
} from "../utils/session-management-token.js";

const SESSION_MANAGEMENT_CHALLENGE_TTL = 1000 * 60 * 5;

export const createSessionManagementChallenge = async (userId: string) => {
  const token = generateSessionManagementToken();
  const tokenHash = hashSessionManagementToken(token);

  await sessionManagementChallengeModel.create({
    user: userId,
    tokenHash,
    expiresAt: new Date(Date.now() + SESSION_MANAGEMENT_CHALLENGE_TTL),
  });

  return token;
};


export const getValidSessionManagementChallenge = async (
  token: string | undefined
) => {
  if (!token) {
    throw new ApiError(
      401,
      "Session management authorization is required"
    );
  }

  const tokenHash = hashSessionManagementToken(token);

  const challenge = await sessionManagementChallengeModel.findOne({
    tokenHash,
    expiresAt: { $gt: new Date() },
  }).select("_id user expiresAt");

  if (!challenge) {
    throw new ApiError(
      401,
      "Session management authorization is invalid or expired"
    );
  }

  return challenge;
};