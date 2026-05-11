import express from "express";
import { getTranscript } from "../controller/video.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/transcript",authMiddleware ,getTranscript);

export default router;