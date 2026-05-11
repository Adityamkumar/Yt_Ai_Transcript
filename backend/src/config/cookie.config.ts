import type { CookieOptions } from "express";

const isProduction = process.env.NODE_ENV === "production";

const ONE_HOUR =  1000 * 60 * 60;
const SEVEN_DAYS = 60 * 60 * 24 * 7 * 1000;
  export const refreshCookieOptions: CookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: SEVEN_DAYS,
      path: "/",
    };

  export const accessCookieOptions: CookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: ONE_HOUR,
      path: "/",
    };