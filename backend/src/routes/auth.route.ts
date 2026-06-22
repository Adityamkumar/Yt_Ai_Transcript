import express from "express";
import {
  userLogin,
  userRegister,
  userLogout,
  refreshAccessToken,
  getCurrentUser,
  deleteUser,
  googleCallbackController,
  googleVerifyController,
  avatarProxyController,
  forgetPassword,
  resetPasswordController,
  validateResetPasswordTokenController,
} from "../controller/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import passport from "passport";

const router = express.Router();

router.post("/register", userRegister);
router.post("/login", userLogin);

router.post("/logout", authMiddleware, userLogout);
router.post("/refresh-token", refreshAccessToken);
router.get("/current-user", authMiddleware, getCurrentUser);
router.delete("/delete/:id", authMiddleware, deleteUser);

router.get("/avatar-proxy", avatarProxyController);

router.get(
  "/google",

  passport.authenticate("google", {
    scope: ["profile", "email"],
  }),
);

router.get(
  "/google/callback",

  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login",
  }),

  googleCallbackController,
);

router.post("/google/verify", googleVerifyController);

router.post('/forgot-password', forgetPassword)
router.get(
  "/reset-password/:token/validate",
  validateResetPasswordTokenController
);
router.post(
  "/reset-password/:token",
  resetPasswordController
);
export default router;

