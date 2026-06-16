import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  createMessage,
  getMessages,
  updateMessage,
  patchSuggestedQuestions,
} from "../controller/message.controller.js";

const router = Router();

router.use(authMiddleware);

router.post("/", createMessage);
router.get("/:conversationId", getMessages);
router.patch("/:messageId", updateMessage);
router.patch("/:messageId/suggestions", patchSuggestedQuestions);

export default router;


