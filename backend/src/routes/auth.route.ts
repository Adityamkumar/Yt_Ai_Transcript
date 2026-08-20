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
  forgetPassword,
  resetPasswordController,
  validateResetPasswordTokenController,
} from "../controller/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authRateLimiterMiddleware } from "../middleware/authRateLimiter.middleware.js";

const router = express.Router();

router.post("/register", userRegister);
router.post("/login", authRateLimiterMiddleware, userLogin);

router.post("/logout", authMiddleware, userLogout);
router.post("/refresh-token", refreshAccessToken);
router.get("/current-user", authMiddleware, getCurrentUser);
router.delete("/delete/:id", authMiddleware, deleteUser);

router.get("/avatar-proxy", avatarProxyController);

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

