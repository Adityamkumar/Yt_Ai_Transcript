import passport from "passport";

import {
  Strategy as GoogleStrategy,
  type Profile,
} from "passport-google-oauth20";

passport.use(
  new GoogleStrategy(
    {
      clientID:
        process.env.GOOGLE_CLIENT_ID!,

      clientSecret:
        process.env.GOOGLE_CLIENT_SECRET!,

      callbackURL:
        process.env.NODE_ENV === "production"
          ? "https://echomindai-6ml3.onrender.com/api/v1/user/google/callback"
          : "http://localhost:8000/api/v1/user/google/callback",
    },

    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done
    ) => {


      return done(null, profile as any);
    }
  )
);

export default passport;
