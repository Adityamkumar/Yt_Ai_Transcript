import express from "express";
import {
  userLogin,
  userRegister,
  userLogout,
  refreshAccessToken,
  getCurrentUser,
  deleteUser,
  googleCallbackController,
} from "../controller/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import passport from "passport";

const router = express.Router();

router.post("/register", userRegister);
router.post("/login", userLogin);

// secured routes
router.post("/logout", authMiddleware, userLogout);
router.post("/refresh-token", refreshAccessToken);
router.get("/current-user", authMiddleware, getCurrentUser);
router.delete("/delete/:id", authMiddleware, deleteUser);

//Google Auth
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

export default router;
