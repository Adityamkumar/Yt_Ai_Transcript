import express from 'express'
import { bookMark, getBookmarks, deleteBookmark } from '../controller/bookmark.controller.js'
import { authIdentityMiddleware } from '../middleware/authIdentity.middleware.js'

const router = express.Router()

router.use(authIdentityMiddleware)
router.post('/create', bookMark)
router.get('/get', getBookmarks)
router.delete('/delete/:id', deleteBookmark)

export default router
