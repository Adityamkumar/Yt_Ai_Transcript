import { Router } from "express";
import { updatePreferences } from "../controller/settings/preferences.controller.js";
import { authIdentityMiddleware } from "../middleware/authIdentity.middleware.js";

const router = Router();

router.use(authIdentityMiddleware)
router.patch("/preferences", updatePreferences);

export default router