import express from 'express'
import { bookMark, getBookmarks, deleteBookmark } from '../controller/bookmark.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'

const router = express.Router()

router.use(authMiddleware)
router.post('/create', bookMark)
router.get('/get', getBookmarks)
router.delete('/delete/:id', deleteBookmark)

export default router