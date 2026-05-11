import express from 'express'
import { userLogin, userRegister, userLogout, refreshAccessToken, getCurrentUser } from '../controller/auth.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'

const router = express.Router()

router.post('/register', userRegister)
router.post('/login', userLogin)

// secured routes
router.post('/logout', authMiddleware, userLogout)
router.post('/refresh-token', refreshAccessToken)
router.get('/current-user', authMiddleware, getCurrentUser)

export default router