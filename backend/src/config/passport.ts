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
        "http://localhost:8000/api/v1/user/google/callback",
    },

    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done
    ) => {


      return done(null, profile);
    }
  )
);

export default passport;