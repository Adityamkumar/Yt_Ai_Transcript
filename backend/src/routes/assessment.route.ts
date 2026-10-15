import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { requireVerifiedEmail } from "../middleware/authIdentity.middleware.js";
import {
	getAssessment,
	getAssessmentResultsController,
	getAssessmentSessionController,
	postAssessment,
	putAssessmentAnswer,
	retryAssessmentEvaluationController,
	startAssessment,
	submitAssessmentController,
} from "../controller/assessment.controller.js";

const router = Router();

router.use(authMiddleware, requireVerifiedEmail);
router.post("/", postAssessment);
router.post("/:assessmentId/start", startAssessment);
router.get("/:assessmentId/session", getAssessmentSessionController);
router.put("/:assessmentId/questions/:questionId/answer", putAssessmentAnswer);
router.post("/:assessmentId/submit", submitAssessmentController);
router.post("/:assessmentId/retry-evaluation", retryAssessmentEvaluationController);
router.get("/:assessmentId/results", getAssessmentResultsController);
router.get("/:assessmentId", getAssessment);

export default router;