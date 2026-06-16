import express from 'express'
import { askQuestion } from '../controller/chat.controller.js'
import { generateFollowUp } from '../controller/followup.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
const router = express.Router()

router.post('/ask', authMiddleware, askQuestion)
router.post('/followup', authMiddleware, generateFollowUp)

export default router

