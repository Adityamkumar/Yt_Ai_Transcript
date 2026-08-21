import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { updatePreferences } from "../controller/settings/preferences.controller.js";

const router = Router();

router.use(authMiddleware)
router.patch("/preferences", updatePreferences);

export default router