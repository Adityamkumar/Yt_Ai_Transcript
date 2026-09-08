import express from 'express'
import { askQuestion } from '../controller/chat.controller.js'
import { generateFollowUp } from '../controller/followup.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { requireVerifiedEmail } from '../middleware/authIdentity.middleware.js'
const router = express.Router()

router.post('/ask', authMiddleware, requireVerifiedEmail ,askQuestion)
router.post('/followup', authMiddleware, requireVerifiedEmail ,generateFollowUp)

export default router

