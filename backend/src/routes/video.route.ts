import express from "express";
import { getTranscript } from "../controller/video.controller.js";

const router = express.Router();

router.post("/transcript", getTranscript);

export default router;