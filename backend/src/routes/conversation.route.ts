import { Router } from "express";
import { authIdentityMiddleware } from "../middleware/authIdentity.middleware.js";
import { 
  conversation, 
  getConversations, 
  deleteConversation 
} from "../controller/conversation.controller.js";

const router = Router();

router.use(authIdentityMiddleware);

router.post("/", conversation);
router.get("/:conversationId", getConversations);
router.delete("/:conversationId", deleteConversation);

export default router;

