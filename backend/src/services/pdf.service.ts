import crypto from "crypto";
import { PdfDocument } from "../models/pdfDocument.model.js";
import { extractPdfText } from "../utils/extractPdfText.js";
import { uploadPdf } from "./imagekit.service.js";
import { Types } from "mongoose";
import logger from "../lib/logger.js";






export const hashPdfBuffer = (buffer: Buffer): string => {
  return crypto.createHash("sha256").update(buffer).digest("hex");
};


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
    logger.error({ error }, "PDF text extraction failed");
    throw new Error("Failed to extract text from the PDF. Make sure it's a valid, text-based document.");
  }

  let uploadResult;
  try {
    uploadResult = await uploadPdf(fileBuffer, fileName, userObjectId.toString());
  } catch (error: any) {
    logger.error({ error }, "ImageKit upload failed");
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
