import express from 'express'
import { askQuestion } from '../controller/chat.controller.js'
const router = express.Router()

router.post('/ask', askQuestion)

export default router