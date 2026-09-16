import crypto from "crypto";

export const hashRefreshToken = (token: string): string => {
  const secret = process.env.REFRESH_TOKEN_HASH_SECRET;

  if (!secret) {
    throw new Error("REFRESH_TOKEN_HASH_SECRET is not configured");
  }

  return crypto
    .createHmac("sha256", secret)
    .update(token)
    .digest("hex");
};