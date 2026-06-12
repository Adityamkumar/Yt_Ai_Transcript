import crypto from "crypto";
import { PdfDocument } from "../models/pdfDocument.model.js";
import { extractPdfText } from "../utils/extractPdfText.js";
import { uploadPdf } from "./imagekit.service.js";
import { Types } from "mongoose";

/**
 * Generates a SHA-256 hex hash from raw PDF file bytes.
 * This is the canonical identity of a physical document for deduplication.
 */
export const hashPdfBuffer = (buffer: Buffer): string => {
  return crypto.createHash("sha256").update(buffer).digest("hex");
};

/**
 * Uploads the PDF file to storage and creates the metadata document.
 * Callers must have already checked for deduplication before calling this.
 */
export const processPdfUpload = async (
  fileBuffer: Buffer,
  fileName: string,
  userId: string | Types.ObjectId,
  title: string,
  documentHash: string
) => {
  const userObjectId = typeof userId === "string" ? new Types.ObjectId(userId) : userId;

  let textExtraction;
  try {
    textExtraction = await extractPdfText(fileBuffer);
  } catch (error: any) {
    console.error("PDF text extraction failed:", error);
    throw new Error("Failed to extract text from the PDF. Make sure it's a valid, text-based document.");
  }

  let uploadResult;
  try {
    uploadResult = await uploadPdf(fileBuffer, fileName, userObjectId.toString());
  } catch (error: any) {
    console.error("ImageKit upload failed:", error);
    throw new Error("Failed to upload the PDF file to storage.");
  }

  const pdfDoc = await PdfDocument.create({
    title,
    fileName,
    fileUrl: uploadResult.url,
    fileId: uploadResult.fileId,
    documentHash,
    pageCount: textExtraction.totalPages,
    uploadedBy: userObjectId,
    status: "processing",
    retryCount: 0,
  });

  return pdfDoc;
};
