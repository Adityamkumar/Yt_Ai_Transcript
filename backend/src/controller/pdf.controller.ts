import mongoose from "mongoose";
import { PdfDocument } from "../models/pdfDocument.model.js";
import { Conversation } from "../models/conversation.model.js";
import { hashPdfBuffer, processPdfUpload } from "../services/pdf.service.js";
import { deletePdf } from "../services/imagekit.service.js";
import { generatePdfTitle, askAiAboutPdf, streamAiAboutPdf } from "../services/ai.service.js";
import { retrieveRelevantChunks } from "../utils/retrieveRelevantChunks.js";
import { formatDocumentContext } from "../utils/formatDocumentContext.js";
import { extractPdfText } from "../utils/extractPdfText.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  ingestPdfForRag,
  MAX_AUTO_RETRIES,
  MAX_TOTAL_RETRIES,
} from "../rag/services/pdfRagIngestion.service.js";
import { deletePdfRagArtifacts } from "../rag/services/pdfRagCleanup.service.js";

// ---------------------------------------------------------------------------
// Title helpers
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Helper: get-or-create a conversation for a pdf document
// ---------------------------------------------------------------------------

const getOrCreateConversation = async (pdfDocId: mongoose.Types.ObjectId, userId: string, title: string) => {
  // Reuse existing conversation if one exists for this document + user
  const existing = await Conversation.findOne({
    pdfDocumentId: pdfDocId,
    userId,
    type: "pdf",
  }).populate("pdfDocumentId");

  if (existing) return existing;

  const created = await Conversation.create({
    userId,
    pdfDocumentId: pdfDocId,
    type: "pdf",
    title,
  });

  return Conversation.findById(created._id).populate("pdfDocumentId");
};

// ---------------------------------------------------------------------------
// uploadPdf — with full deduplication by documentHash
// ---------------------------------------------------------------------------

export const uploadPdf = asyncHandler(async (req: any, res) => {
  if (!req.file) {
    throw new ApiError(400, "No PDF file uploaded");
  }

  if (req.file.size > 10 * 1024 * 1024) {
    throw new ApiError(400, "PDF file exceeds the maximum size limit of 10MB");
  }

  const originalName = req.file.originalname;
  const fileBuffer: Buffer = req.file.buffer;

  // ------------------------------------------------------------------
  // STEP 1 — Hash the bytes for deduplication (not filename, not URL)
  // ------------------------------------------------------------------
  const documentHash = hashPdfBuffer(fileBuffer);

  // ------------------------------------------------------------------
  // STEP 2 — Deduplication check
  // ------------------------------------------------------------------
  const existing = await PdfDocument.findOne({ documentHash });

  if (existing) {
    const effectiveRagStatus = existing.ragStatus ?? existing.status;

    if (effectiveRagStatus === "ready") {
      // CASE A — Document already fully indexed. Reuse silently.
      const conversation = await getOrCreateConversation(
        existing._id as mongoose.Types.ObjectId,
        req.user._id,
        existing.title,
      );
      return res.status(200).json(
        new ApiResponse(200, conversation, "PDF uploaded and workspace created successfully"),
      );
    }

    if (effectiveRagStatus === "processing") {
      // CASE B — Already ingesting. Return existing workspace, UI will poll.
      const conversation = await getOrCreateConversation(
        existing._id as mongoose.Types.ObjectId,
        req.user._id,
        existing.title,
      );
      return res.status(200).json(
        new ApiResponse(200, conversation, "PDF uploaded and workspace created successfully"),
      );
    }

    if (effectiveRagStatus === "failed") {
      // CASE C — Previously failed. Re-trigger ingestion on the SAME document.
      // Only re-trigger if still within auto-retry budget.
      if (existing.retryCount < MAX_AUTO_RETRIES) {
        await PdfDocument.findByIdAndUpdate(existing._id, {
          status: "processing",
          ragStatus: "processing",
        });

        ingestPdfForRag({
          pdfDocumentId: existing._id,
          title: existing.title,
          fileName: existing.fileName,
          fileUrl: existing.fileUrl,
          fileId: existing.fileId,
          uploadedBy: req.user._id,
        }).catch((err: Error) => {
          console.error("[RAG] Background re-ingestion (dedup case C) failed:", err.message);
        });
      }
      // If retryCount >= MAX_AUTO_RETRIES, leave as failed — manual retry button handles it.

      const conversation = await getOrCreateConversation(
        existing._id as mongoose.Types.ObjectId,
        req.user._id,
        existing.title,
      );
      return res.status(200).json(
        new ApiResponse(200, conversation, "PDF uploaded and workspace created successfully"),
      );
    }
  }

  // ------------------------------------------------------------------
  // STEP 3 — New document: extract text, generate title, upload, ingest
  // ------------------------------------------------------------------
  let parsedText = "";
  try {
    const textRes = await extractPdfText(fileBuffer);
    parsedText = textRes.pages.map((p) => p.text).join(" ");
  } catch (err) {
    throw new ApiError(400, "Failed to parse PDF file text");
  }

  const aiTitle = await generatePdfTitle(parsedText);
  const title = resolvePdfTitle(aiTitle, originalName);

  const pdfDoc = await processPdfUpload(fileBuffer, originalName, req.user._id, title, documentHash);

  ingestPdfForRag({
    pdfDocumentId: pdfDoc._id,
    title,
    fileName: originalName,
    fileUrl: pdfDoc.fileUrl,
    fileId: pdfDoc.fileId,
    uploadedBy: req.user._id,
  }).catch((err: Error) => {
    console.error("[RAG] Background PDF ingestion failed:", err.message);
  });

  const conversation = await Conversation.create({
    userId: req.user._id,
    pdfDocumentId: pdfDoc._id,
    type: "pdf",
    title,
  });

  const populatedConversation = await Conversation.findById(conversation._id).populate("pdfDocumentId");

  return res.status(200).json(
    new ApiResponse(200, populatedConversation, "PDF uploaded and workspace created successfully"),
  );
});

// ---------------------------------------------------------------------------
// getPdfStatus — includes ragStatus + retryCount for frontend decisions
// ---------------------------------------------------------------------------

export const getPdfStatus = asyncHandler(async (req, res) => {
  const { documentId } = req.params;
  const pdfDoc = await PdfDocument.findById(documentId);
  if (!pdfDoc) {
    throw new ApiError(404, "Document not found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        status: pdfDoc.status,
        ragStatus: pdfDoc.ragStatus ?? pdfDoc.status,
        totalChunks: pdfDoc.totalChunks,
        retryCount: pdfDoc.retryCount,
        maxRetries: MAX_TOTAL_RETRIES,
      },
      "Status fetched successfully",
    ),
  );
});

// ---------------------------------------------------------------------------
// retryPdfIngestion — manual retry with hard limit
// ---------------------------------------------------------------------------

export const retryPdfIngestion = asyncHandler(async (req: any, res) => {
  const { documentId } = req.params;

  const pdfDoc = await PdfDocument.findOne({ _id: documentId, uploadedBy: req.user._id });
  if (!pdfDoc) {
    throw new ApiError(404, "PDF Document not found or unauthorized");
  }

  const effectiveRagStatus = pdfDoc.ragStatus ?? pdfDoc.status;
  if (effectiveRagStatus !== "failed") {
    throw new ApiError(400, "Retry is only valid for documents in a failed state");
  }

  // Enforce total retry cap — auto + manual combined
  if (pdfDoc.retryCount >= MAX_TOTAL_RETRIES) {
    throw new ApiError(429, "Maximum retry attempts reached. Please contact support if the issue persists.");
  }

  // Reset status immediately so frontend can start polling
  await PdfDocument.findByIdAndUpdate(pdfDoc._id, {
    status: "processing",
    ragStatus: "processing",
  });

  ingestPdfForRag({
    pdfDocumentId: pdfDoc._id,
    title: pdfDoc.title,
    fileName: pdfDoc.fileName,
    fileUrl: pdfDoc.fileUrl,
    fileId: pdfDoc.fileId,
    uploadedBy: req.user._id,
  }).catch((err: Error) => {
    console.error("[RAG] Manual retry ingestion failed:", err.message);
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        ragStatus: "processing",
        retryCount: pdfDoc.retryCount,
        maxRetries: MAX_TOTAL_RETRIES,
      },
      "Re-indexing started successfully",
    ),
  );
});

// ---------------------------------------------------------------------------
// askPdfQuestion — unchanged
// ---------------------------------------------------------------------------

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
  const isStreaming =
    stream ||
    acceptHeader.includes("text/event-stream") ||
    (acceptHeader.includes("text/plain") && !acceptHeader.includes("application/json"));

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

// ---------------------------------------------------------------------------
// deletePdfDocument — unchanged
// ---------------------------------------------------------------------------

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

  try {
    await deletePdfRagArtifacts(pdfDoc._id);
  } catch (err: any) {
    console.error("[RAG Cleanup] Failed to delete RAG chunks for documentId=", pdfDoc._id, ":", err?.message);
  }

  await PdfDocument.findByIdAndDelete(pdfDoc._id);

  const conversations = await Conversation.find({ pdfDocumentId: pdfDoc._id });
  for (const conv of conversations) {
    await mongoose.model("Message").deleteMany({ conversationId: conv._id });
    await Conversation.findByIdAndDelete(conv._id);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "PDF Document and all associated workspaces deleted successfully"));
});
