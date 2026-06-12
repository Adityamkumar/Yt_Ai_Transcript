import { Router } from "express";
import multer from "multer";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  uploadPdf,
  getPdfStatus,
  askPdfQuestion,
  deletePdfDocument,
  retryPdfIngestion,
} from "../controller/pdf.controller.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, 
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
router.post("/retry/:documentId", retryPdfIngestion);
router.post("/ask", askPdfQuestion);
router.delete("/:documentId", deletePdfDocument);

export default router;

