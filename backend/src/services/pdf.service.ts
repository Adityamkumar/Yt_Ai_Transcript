import { PdfDocument } from "../models/pdfDocument.model.js";
import { extractPdfText } from "../utils/extractPdfText.js";
import { chunkDocument } from "../utils/chunkDocument.js";
import { uploadPdf } from "./imagekit.service.js";
import { Types } from "mongoose";

export const processPdfUpload = async (
  fileBuffer: Buffer,
  fileName: string,
  userId: string | Types.ObjectId,
  title: string
) => {
  const userObjectId = typeof userId === "string" ? new Types.ObjectId(userId) : userId;

  // 1. Parse and extract text first to validate and fail fast
  let textExtraction;
  try {
    textExtraction = await extractPdfText(fileBuffer);
  } catch (error: any) {
    console.error("PDF text extraction failed:", error);
    throw new Error("Failed to extract text from the PDF. Make sure it's a valid, text-based document.");
  }

  // 2. Upload file to ImageKit
  let uploadResult;
  try {
    uploadResult = await uploadPdf(fileBuffer, fileName, userObjectId.toString());
  } catch (error: any) {
    console.error("ImageKit upload failed:", error);
    throw new Error("Failed to upload the PDF file to storage.");
  }

  // 3. Create document record with processing status
  const pdfDoc = await PdfDocument.create({
    title,
    fileName,
    fileUrl: uploadResult.url,
    fileId: uploadResult.fileId,
    pageCount: textExtraction.totalPages,
    uploadedBy: userObjectId,
    status: "processing",
  });

  try {
    // 4. Chunk document semantically
    const chunks = chunkDocument(textExtraction.pages);
    
    // 5. Store chunks in-document
    pdfDoc.chunks = chunks.map(chunk => ({
      text: chunk.text,
      chunkIndex: chunk.chunkIndex,
      page: chunk.page,
      wordCount: chunk.wordCount,
    }));

    // 6. Complete status
    pdfDoc.totalChunks = chunks.length;
    pdfDoc.status = "ready";
    await pdfDoc.save();

    return pdfDoc;
  } catch (error: any) {
    console.error("PDF chunking/indexing failure:", error);
    pdfDoc.status = "failed";
    await pdfDoc.save();
    throw new Error("Failed to index PDF document contents.");
  }
};
