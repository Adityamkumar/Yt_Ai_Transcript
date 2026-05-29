import mongoose from "mongoose";
import { PdfDocument } from "../models/pdfDocument.model.js";
import { Conversation } from "../models/conversation.model.js";
import { processPdfUpload } from "../services/pdf.service.js";
import { deletePdf } from "../services/imagekit.service.js";
import { generatePdfTitle, askAiAboutPdf, streamAiAboutPdf } from "../services/ai.service.js";
import { retrieveRelevantChunks } from "../utils/retrieveRelevantChunks.js";
import { formatDocumentContext } from "../utils/formatDocumentContext.js";
import { extractPdfText } from "../utils/extractPdfText.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const GENERIC_PDF_TITLES = new Set([
  "new document",
  "untitled",
  "document",
  "pdf document",
  "new pdf",
  "new chat",
]);

const buildReadableTitleFromFilename = (filename: string) => {
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
  return nameWithoutExt
    .replace(/[_\-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const resolvePdfTitle = (aiTitle: string | undefined, originalName: string) => {
  const cleanedAiTitle = (aiTitle || "")
    .replace(/["'`*]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const normalized = cleanedAiTitle.toLowerCase();
  const isGeneric = !cleanedAiTitle || GENERIC_PDF_TITLES.has(normalized);

  if (!isGeneric) {
    return cleanedAiTitle;
  }

  const filenameTitle = buildReadableTitleFromFilename(originalName);
  return filenameTitle || "Document";
};

export const uploadPdf = asyncHandler(async (req: any, res) => {
  if (!req.file) {
    throw new ApiError(400, "No PDF file uploaded");
  }

  if (req.file.size > 10 * 1024 * 1024) {
    throw new ApiError(400, "PDF file exceeds the maximum size limit of 10MB");
  }

  const originalName = req.file.originalname;
  const fileBuffer = req.file.buffer;

  let parsedText = "";
  try {
    const textRes = await extractPdfText(fileBuffer);
    parsedText = textRes.pages.map(p => p.text).join(" ");
  } catch (err) {
    throw new ApiError(400, "Failed to parse PDF file text");
  }

  const aiTitle = await generatePdfTitle(parsedText);
  const title = resolvePdfTitle(aiTitle, originalName);

  const pdfDoc = await processPdfUpload(fileBuffer, originalName, req.user._id, title);

  const conversation = await Conversation.create({
    userId: req.user._id,
    pdfDocumentId: pdfDoc._id,
    type: "pdf",
    title: title,
  });

  const populatedConversation = await Conversation.findById(conversation._id).populate("pdfDocumentId");

  return res.status(200).json(
    new ApiResponse(200, populatedConversation, "PDF uploaded and workspace created successfully")
  );
});

export const getPdfStatus = asyncHandler(async (req, res) => {
  const { documentId } = req.params;
  const pdfDoc = await PdfDocument.findById(documentId);
  if (!pdfDoc) {
    throw new ApiError(404, "Document not found");
  }

  return res.status(200).json(
    new ApiResponse(200, { status: pdfDoc.status, totalChunks: pdfDoc.totalChunks }, "Status fetched successfully")
  );
});

export const askPdfQuestion = asyncHandler(async (req, res) => {
  const { documentId, question, recentMessages = [], type = "chat", stream = false } = req.body;

  if (!documentId || (!question && type !== "notes")) {
    throw new ApiError(400, "documentId and question are required");
  }

  const pdfDoc = await PdfDocument.findById(documentId);
  if (!pdfDoc) {
    throw new ApiError(404, "PDF Document not found");
  }

  const chunks = await retrieveRelevantChunks(pdfDoc._id, question || "", 8);
  const contextText = formatDocumentContext(chunks);

  const acceptHeader = req.headers.accept || "";
  const isStreaming = stream || acceptHeader.includes("text/event-stream") || (acceptHeader.includes("text/plain") && !acceptHeader.includes("application/json"));

  if (type === "notes" || !isStreaming) {
    const answer = await askAiAboutPdf(contextText, question || "", recentMessages, type);
    return res.status(200).json(new ApiResponse(200, answer, "Answer generated successfully"));
  }

  res.status(200);
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();

  let closed = false;
  req.on("close", () => {
    closed = true;
  });

  try {
    for await (const chunk of streamAiAboutPdf(contextText, question || "", recentMessages, type)) {
      if (closed || res.destroyed) break;
      res.write(chunk);
    }
    if (!closed && !res.destroyed) {
      res.end();
    }
  } catch (error: any) {
    if (!closed && !res.destroyed) {
      if (!res.headersSent) {
        res.status(500);
      }
      res.write(`\n\nI'm sorry, I encountered a brief technical issue: ${error.message}`);
      res.end();
    }
  }
});

export const deletePdfDocument = asyncHandler(async (req: any, res) => {
  const { documentId } = req.params;
  const pdfDoc = await PdfDocument.findOne({ _id: documentId, uploadedBy: req.user._id });
  if (!pdfDoc) {
    throw new ApiError(404, "PDF Document not found or unauthorized");
  }

  try {
    await deletePdf(pdfDoc.fileId);
  } catch (err) {
    console.error("Failed to delete PDF from ImageKit storage:", err);
  }

  await PdfDocument.findByIdAndDelete(pdfDoc._id);

  const conversations = await Conversation.find({ pdfDocumentId: pdfDoc._id });
  for (const conv of conversations) {
    await mongoose.model("Message").deleteMany({ conversationId: conv._id });
    await Conversation.findByIdAndDelete(conv._id);
  }

  return res.status(200).json(new ApiResponse(200, {}, "PDF Document and all associated workspaces deleted successfully"));
});

