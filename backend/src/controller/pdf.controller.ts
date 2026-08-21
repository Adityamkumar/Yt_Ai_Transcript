import mongoose from "mongoose";
import { PdfDocument } from "../models/pdfDocument.model.js";
import { Conversation } from "../models/conversation.model.js";
import { hashPdfBuffer, processPdfUpload } from "../services/pdf.service.js";
import { deletePdf } from "../services/imagekit.service.js";
import {
  generatePdfTitle,
  askAiAboutPdf,
  streamAiAboutPdf,
} from "../services/ai.service.js";
import { retrieveRelevantChunks } from "../utils/retrieveRelevantChunks.js";
import { isSimpleGreeting } from "../utils/greeting.js";
import { formatDocumentContext } from "../utils/formatDocumentContext.js";
import { extractPdfText } from "../utils/extractPdfText.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  ingestPdfForRag,
  MAX_AUTO_RETRIES,
  MAX_RETRY_COUNT,
} from "../rag/services/pdfRagIngestion.service.js";
import { deletePdfRagArtifacts } from "../rag/services/pdfRagCleanup.service.js";
import logger from "../lib/logger.js";

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

const getOrCreateConversation = async (
  pdfDocId: mongoose.Types.ObjectId,
  userId: string,
  title: string,
) => {
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

export const uploadPdf = asyncHandler(async (req: any, res) => {
  if (!req.file) {
    throw new ApiError(400, "No PDF file uploaded");
  }

  if (req.file.size > 10 * 1024 * 1024) {
    throw new ApiError(400, "PDF file exceeds the maximum size limit of 10MB");
  }

  const originalName = req.file.originalname;
  const fileBuffer: Buffer = req.file.buffer;

  const documentHash = hashPdfBuffer(fileBuffer);

  const existing = await PdfDocument.findOne({ documentHash });

  if (existing) {
    const effectiveRagStatus = existing.ragStatus ?? existing.status;

    if (effectiveRagStatus === "ready") {
      const conversation = await getOrCreateConversation(
        existing._id as mongoose.Types.ObjectId,
        req.user._id,
        existing.title,
      );
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            conversation,
            "PDF uploaded and workspace created successfully",
          ),
        );
    }

    if (effectiveRagStatus === "processing") {
      const conversation = await getOrCreateConversation(
        existing._id as mongoose.Types.ObjectId,
        req.user._id,
        existing.title,
      );
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            conversation,
            "PDF uploaded and workspace created successfully",
          ),
        );
    }

    if (effectiveRagStatus === "failed") {
      const now = new Date();
      const isInCooldown =
        existing.cooldownUntil && now < existing.cooldownUntil;

      if (existing.retryCount < MAX_AUTO_RETRIES && !isInCooldown) {
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
          logger.error(
            { err },
            "[RAG] Background re-ingestion (dedup case C) failed"
          );
        });
      }

      const conversation = await getOrCreateConversation(
        existing._id as mongoose.Types.ObjectId,
        req.user._id,
        existing.title,
      );
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            conversation,
            "PDF uploaded and workspace created successfully",
          ),
        );
    }
  }

  let parsedText = "";
  try {
    const textRes = await extractPdfText(fileBuffer);
    parsedText = textRes.pages.map((p) => p.text).join(" ");
  } catch (err) {
    throw new ApiError(400, "Failed to parse PDF file text");
  }

  const aiTitle = await generatePdfTitle(parsedText);
  const title = resolvePdfTitle(aiTitle, originalName);

  const pdfDoc = await processPdfUpload(
    fileBuffer,
    originalName,
    req.user._id,
    title,
    documentHash,
  );

  ingestPdfForRag({
    pdfDocumentId: pdfDoc._id,
    title,
    fileName: originalName,
    fileUrl: pdfDoc.fileUrl,
    fileId: pdfDoc.fileId,
    uploadedBy: req.user._id,
  }).catch((err: Error) => {
    logger.error({ err }, "[RAG] Background PDF ingestion failed");
  });

  const conversation = await Conversation.create({
    userId: req.user._id,
    pdfDocumentId: pdfDoc._id,
    type: "pdf",
    title,
  });

  const populatedConversation = await Conversation.findById(
    conversation._id,
  ).populate("pdfDocumentId");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        populatedConversation,
        "PDF uploaded and workspace created successfully",
      ),
    );
});

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
        maxRetries: MAX_RETRY_COUNT,
        cooldownUntil: pdfDoc.cooldownUntil,
      },
      "Status fetched successfully",
    ),
  );
});

export const retryPdfIngestion = asyncHandler(async (req: any, res) => {
  const { documentId } = req.params;

  const pdfDoc = await PdfDocument.findOne({
    _id: documentId,
    uploadedBy: req.user._id,
  });
  if (!pdfDoc) {
    throw new ApiError(404, "PDF Document not found or unauthorized");
  }

  const effectiveRagStatus = pdfDoc.ragStatus ?? pdfDoc.status;
  if (effectiveRagStatus !== "failed") {
    throw new ApiError(
      400,
      "Retry is only valid for documents in a failed state",
    );
  }

  const now = new Date();
  const isInCooldown = pdfDoc.cooldownUntil && now < pdfDoc.cooldownUntil;
  if (isInCooldown) {
    throw new ApiError(
      429,
      "AI indexing is temporarily paused. Please try again shortly.",
    );
  }

  let nextRetryCount = pdfDoc.retryCount;
  if (pdfDoc.cooldownUntil && now >= pdfDoc.cooldownUntil) {
    nextRetryCount = 0;
    await PdfDocument.findByIdAndUpdate(pdfDoc._id, {
      retryCount: 0,
      $unset: { cooldownUntil: "" },
    });
  } else if (pdfDoc.retryCount >= MAX_RETRY_COUNT) {
    const cooldownTime = new Date(Date.now() + 10 * 60 * 1000);
    await PdfDocument.findByIdAndUpdate(pdfDoc._id, {
      cooldownUntil: cooldownTime,
    });
    throw new ApiError(
      429,
      "Retry limit reached. Entering 10-minute cooldown.",
    );
  }

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
    logger.error({ err }, "[RAG] Manual retry ingestion failed");
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        ragStatus: "processing",
        retryCount: nextRetryCount,
        maxRetries: MAX_RETRY_COUNT,
        cooldownUntil: undefined,
      },
      "Re-indexing started successfully",
    ),
  );
});

export const askPdfQuestion = asyncHandler(async (req, res) => {
  const {
    documentId,
    question,
    recentMessages = [],
    type = "chat",
    stream = false,
  } = req.body;

  const responseLanguage = req.user?.preferences.responseLanguage

  if (!documentId || (!question && type !== "notes")) {
    throw new ApiError(400, "documentId and question are required");
  }

  const pdfDoc = await PdfDocument.findById(documentId);
  if (!pdfDoc) {
    throw new ApiError(404, "PDF Document not found");
  }

  let chunks: any[] = [];
  if (question && !isSimpleGreeting(question)) {
    chunks = await retrieveRelevantChunks(pdfDoc._id, question, 8);
  }
  const contextText = formatDocumentContext(chunks);

  const acceptHeader = req.headers.accept || "";
  const isStreaming =
    stream ||
    acceptHeader.includes("text/event-stream") ||
    (acceptHeader.includes("text/plain") &&
      !acceptHeader.includes("application/json"));

  if (type === "notes" || !isStreaming) {
    const answer = await askAiAboutPdf(
      contextText,
      question || "",
      responseLanguage!,
      recentMessages,
      type
    );
    return res
      .status(200)
      .json(new ApiResponse(200, answer, "Answer generated successfully"));
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
    for await (const chunk of streamAiAboutPdf(
      contextText,
      question || "",
      recentMessages,
      type,
      responseLanguage!
    )) {
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
      res.write(
        `\n\nI'm sorry, I encountered a brief technical issue: ${error.message}`,
      );
      res.end();
    }
  }
});

export const deletePdfDocument = asyncHandler(async (req: any, res) => {
  const { documentId } = req.params;
  const pdfDoc = await PdfDocument.findOne({
    _id: documentId,
    uploadedBy: req.user._id,
  });
  if (!pdfDoc) {
    throw new ApiError(404, "PDF Document not found or unauthorized");
  }

  try {
    await deletePdf(pdfDoc.fileId);
  } catch (err) {
    logger.error({ err }, "Failed to delete PDF from ImageKit storage");
  }

  try {
    await deletePdfRagArtifacts(pdfDoc._id);
  } catch (err: any) {
    logger.error(
      { err, documentId: pdfDoc._id },
      "[RAG Cleanup] Failed to delete RAG chunks"
    );
  }

  await PdfDocument.findByIdAndDelete(pdfDoc._id);

  const conversations = await Conversation.find({ pdfDocumentId: pdfDoc._id });
  for (const conv of conversations) {
    await mongoose.model("Message").deleteMany({ conversationId: conv._id });
    await Conversation.findByIdAndDelete(conv._id);
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "PDF Document and all associated workspaces deleted successfully",
      ),
    );
});
