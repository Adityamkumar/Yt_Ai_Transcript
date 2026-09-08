import express from "express";
import { getTranscript } from "../controller/video.controller.js";
import { authIdentityMiddleware, requireVerifiedEmail } from "../middleware/authIdentity.middleware.js";

const router = express.Router();

router.post("/transcript",authIdentityMiddleware, requireVerifiedEmail ,getTranscript);

export default router;
