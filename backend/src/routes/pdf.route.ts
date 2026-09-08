import { Router } from "express";
import multer from "multer";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  authIdentityMiddleware,
  requireVerifiedEmail,
} from "../middleware/authIdentity.middleware.js";
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
    const isPdfMime = ["application/pdf", "application/octet-stream"].includes(
      file.mimetype,
    );
    const isPdfExt = file.originalname.toLowerCase().endsWith(".pdf");
    if (isPdfMime || isPdfExt) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

router.post(
  "/upload",
  authIdentityMiddleware,
  requireVerifiedEmail,
  upload.single("file"),
  uploadPdf,
);
router.get(
  "/status/:documentId",
  authMiddleware,
  requireVerifiedEmail,
  getPdfStatus,
);
router.post(
  "/retry/:documentId",
  authIdentityMiddleware,
  requireVerifiedEmail,
  retryPdfIngestion,
);
router.post("/ask", authMiddleware, requireVerifiedEmail, askPdfQuestion);
router.delete(
  "/:documentId",
  authIdentityMiddleware,
  requireVerifiedEmail,
  deletePdfDocument,
);

export default router;
