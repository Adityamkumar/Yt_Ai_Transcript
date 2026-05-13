import express from 'express'
import { bookMark, getBookmarks } from '../controller/bookmark.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'

const router = express.Router()

router.use(authMiddleware)
router.post('/create', bookMark)
router.get('/get', getBookmarks)




export default router