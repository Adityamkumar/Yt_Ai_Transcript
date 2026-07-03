import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { search } from "./search.controller.js";

const router = Router();

router.use(authMiddleware);
router.get("/", search);

export default router;
