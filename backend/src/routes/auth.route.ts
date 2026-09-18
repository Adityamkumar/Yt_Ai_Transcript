import express from "express";
import {
  userLogin,
  userRegister,
  userLogout,
  refreshAccessToken,
  getCurrentUser,
  deleteUser,
  googleVerifyController,
  avatarProxyController,
  forgotPassword,
  resetPasswordController,
  validateResetPasswordTokenController,
  verifyEmail,
  resendEmailVerification,
  logoutAllDevices,
  getActiveSessions,
  logoutSession,
  logoutSessionWithChallenge,
} from "../controller/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authIdentityMiddleware } from "../middleware/authIdentity.middleware.js";
import { authRateLimiterMiddleware } from "../middleware/authRateLimiter.middleware.js";

const router = express.Router();

router.post("/register", userRegister);
router.post("/login", authRateLimiterMiddleware, userLogin);

router.post("/logout", authIdentityMiddleware, userLogout);
router.post("/logout-all", authIdentityMiddleware, logoutAllDevices);

router.get("/sessions", authIdentityMiddleware, getActiveSessions);

router.post(
  "/sessions/:sessionId/logout",
  authIdentityMiddleware,
  logoutSession,
);

router.post(
  "/session-management/sessions/:sessionId/logout",
  logoutSessionWithChallenge,
);

router.post("/refresh-token", refreshAccessToken);
router.get("/current-user", authMiddleware, getCurrentUser);
router.delete("/delete/:id", authIdentityMiddleware, deleteUser);

router.get("/avatar-proxy", avatarProxyController);

router.post("/google/verify", googleVerifyController);

router.post("/forgot-password", forgotPassword);
router.get(
  "/reset-password/:token/validate",
  validateResetPasswordTokenController,
);
router.post("/reset-password/:token", resetPasswordController);

router.get("/verify-email/:verificationToken", verifyEmail);
router.post("/resend-email-verification", resendEmailVerification);

export default router;
