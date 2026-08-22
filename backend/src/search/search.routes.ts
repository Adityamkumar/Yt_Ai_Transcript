import { Router } from "express";
import { authIdentityMiddleware } from "../middleware/authIdentity.middleware.js";
import { search } from "./search.controller.js";

const router = Router();

router.use(authIdentityMiddleware);
router.get("/", search);

export default router;
