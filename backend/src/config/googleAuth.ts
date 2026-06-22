import { OAuth2Client } from "google-auth-library";

// When receiving authorization code from frontend popup (GIS),
// Google requires the redirect URI to be literally the string 'postmessage'.
export const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "postmessage"
);
