import { Router } from "express";
import multer from "multer";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  uploadPdf,
  getPdfStatus,
  askPdfQuestion,
  deletePdfDocument,
} from "../controller/pdf.controller.js";

const router = Router();

// Configure multer for memory storage with 10MB limit
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

router.use(authMiddleware);

router.post("/upload", upload.single("file"), uploadPdf);
router.get("/status/:documentId", getPdfStatus);
router.post("/ask", askPdfQuestion);
router.delete("/:documentId", deletePdfDocument);

export default router;
