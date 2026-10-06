import { Router } from "express";
import { authIdentityMiddleware } from "../middleware/authIdentity.middleware.js";
import { 
  conversation, 
  getConversations, 
  deleteConversation,
  updateConversationPin
} from "../controller/conversation.controller.js";

const router = Router();

router.use(authIdentityMiddleware);

router.post("/", conversation);
router.get("/:conversationId", getConversations);
router.patch("/:conversationId", updateConversationPin);
router.delete("/:conversationId", deleteConversation);

export default router;

