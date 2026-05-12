import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { 
  conversation, 
  getConversations, 
  deleteConversation 
} from "../controller/conversation.controller.js";

const router = Router();

router.use(authMiddleware);

router.post("/", conversation);
router.get("/:conversationId", getConversations);
router.delete("/:conversationId", deleteConversation);

export default router;
