import express from "express";
import { getTranscript } from "../controller/video.controller.js";
import { authIdentityMiddleware } from "../middleware/authIdentity.middleware.js";

const router = express.Router();

router.post("/transcript",authIdentityMiddleware ,getTranscript);

export default router;
