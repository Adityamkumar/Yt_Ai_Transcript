import crypto from "node:crypto";

const SESSION_MANAGEMENT_TOKEN_BYTES = 32;

export const generateSessionManagementToken = (): string => {
  return crypto
    .randomBytes(SESSION_MANAGEMENT_TOKEN_BYTES)
    .toString("base64url");
};

export const hashSessionManagementToken = (
  token: string
): string => {
  const secret = process.env.SESSION_MANAGEMENT_TOKEN_SECRET;

  if (!secret) {
    throw new Error(
      "SESSION_MANAGEMENT_TOKEN_SECRET is not configured"
    );
  }

  return crypto
    .createHmac("sha256", secret)
    .update(token)
    .digest("hex");
};