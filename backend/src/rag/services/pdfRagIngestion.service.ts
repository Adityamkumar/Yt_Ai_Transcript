import axios from "axios";
import { Types } from "mongoose";
import { PdfChunk } from "../../models/pdfChunk.model.js";
import { PdfDocument } from "../../models/pdfDocument.model.js";
import { extractPdfText } from "../../utils/extractPdfText.js";
import { chunkPdfPagesForRag } from "../chunking/pdfChunking.service.js";
import { generateDocumentEmbeddingWithRetry } from "../utils/embeddingRetry.util.js";

export type IngestPdfForRagInput = {
  pdfDocumentId: string | Types.ObjectId;
  title: string;
  fileName: string;
  fileUrl: string;
  fileId: string;
  uploadedBy: string | Types.ObjectId;
};

/** Maximum number of automatic ingestion attempts before requiring manual intervention. */
export const MAX_AUTO_RETRIES = 2;

/** Maximum number of manual retries a user can trigger (on top of auto retries). */
export const MAX_MANUAL_RETRIES = 2;

/** Total maximum ingestion attempts across both auto and manual retries. */
export const MAX_TOTAL_RETRIES = MAX_AUTO_RETRIES + MAX_MANUAL_RETRIES;

const toObjectId = (value: string | Types.ObjectId): Types.ObjectId =>
  typeof value === "string" ? new Types.ObjectId(value) : value;

const fetchPdfBufferFromUrl = async (fileUrl: string): Promise<Buffer> => {
  const response = await axios.get<ArrayBuffer>(fileUrl, {
    responseType: "arraybuffer",
  });
  return Buffer.from(response.data);
};

const EMBEDDING_BATCH_SIZE = 5;
const EMBEDDING_BATCH_DELAY_MS = 200;

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const generateEmbeddingsForChunks = async (
  chunks: Array<{ text: string; chunkIndex: number; page: number; wordCount: number }>,
  title: string,
): Promise<Array<{ text: string; chunkIndex: number; page: number; wordCount: number; embedding: number[] }>> => {
  const result: Array<{ text: string; chunkIndex: number; page: number; wordCount: number; embedding: number[] }> = [];

  for (let i = 0; i < chunks.length; i += EMBEDDING_BATCH_SIZE) {
    const batch = chunks.slice(i, i + EMBEDDING_BATCH_SIZE);

    const batchResults = await Promise.all(
      batch.map(async (chunk) => {
        const embedding = await generateDocumentEmbeddingWithRetry(chunk.text, title);
        return { ...chunk, embedding };
      }),
    );

    result.push(...batchResults);

    const isLastBatch = i + EMBEDDING_BATCH_SIZE >= chunks.length;
    if (!isLastBatch) {
      await sleep(EMBEDDING_BATCH_DELAY_MS);
    }
  }

  return result;
};

/**
 * Idempotent RAG ingestion pipeline for a PDF document.
 *
 * Reliability rules:
 * - Always deletes existing PdfChunks before inserting new ones (idempotent).
 * - On failure, increments retryCount on the document.
 * - Callers are responsible for checking retry limits BEFORE calling this function.
 */
export const ingestPdfForRag = async ({
  pdfDocumentId,
  title,
  fileName: _fileName,
  fileUrl,
  fileId: _fileId,
  uploadedBy: _uploadedBy,
}: IngestPdfForRagInput): Promise<void> => {
  const documentObjectId = toObjectId(pdfDocumentId);

  await PdfDocument.findByIdAndUpdate(documentObjectId, {
    status: "processing",
    ragStatus: "processing",
  });

  // Clean up any stale chunks/vector data before starting ingestion attempt (idempotency rule)
  await PdfChunk.deleteMany({ documentId: documentObjectId });

  try {
    const pdfBuffer = await fetchPdfBufferFromUrl(fileUrl);
    const textExtraction = await extractPdfText(pdfBuffer);
    const chunks = chunkPdfPagesForRag(textExtraction.pages);

    if (chunks.length === 0) {
      throw new Error(
        `No text chunks were generated from PDF "${title}". The document may be image-only or empty.`,
      );
    }

    const embeddedChunks = await generateEmbeddingsForChunks(chunks, title);

    // Idempotent: always wipe stale chunks before inserting fresh ones
    await PdfChunk.deleteMany({ documentId: documentObjectId });

    await PdfChunk.insertMany(
      embeddedChunks.map((chunk) => ({
        documentId: documentObjectId,
        text: chunk.text,
        embedding: chunk.embedding,
        chunkIndex: chunk.chunkIndex,
        page: chunk.page,
        wordCount: chunk.wordCount,
      })),
    );

    // On success: reset retryCount and clear cooldownUntil
    await PdfDocument.findByIdAndUpdate(documentObjectId, {
      status: "ready",
      ragStatus: "ready",
      totalChunks: embeddedChunks.length,
      retryCount: 0,
      $unset: { cooldownUntil: "" },
    });

    console.info(
      `[RAG] PDF ingestion complete. documentId=${documentObjectId}, chunks=${embeddedChunks.length}`,
    );
  } catch (error: any) {
    // Increment retryCount and mark as failed
    const updatedDoc = await PdfDocument.findByIdAndUpdate(
      documentObjectId,
      {
        status: "failed",
        ragStatus: "failed",
        $inc: { retryCount: 1 },
      },
      { new: true }
    );

    // Clean up any partially ingested chunks
    await PdfChunk.deleteMany({ documentId: documentObjectId });

    if (updatedDoc) {
      if (updatedDoc.retryCount < MAX_AUTO_RETRIES) {
        console.info(`[RAG] Auto-retry ingestion (attempt ${updatedDoc.retryCount + 1}) for documentId=${documentObjectId}`);
        // Trigger ingestPdfForRag in the background again
        ingestPdfForRag({
          pdfDocumentId,
          title,
          fileName: _fileName,
          fileUrl,
          fileId: _fileId,
          uploadedBy: _uploadedBy,
        }).catch((err: Error) => {
          console.error(`[RAG] Background auto-retry ingestion failed:`, err.message);
        });
      } else if (updatedDoc.retryCount >= MAX_TOTAL_RETRIES) {
        // If we reached or exceeded 4 attempts, set 10-minute cooldown
        const cooldownTime = new Date(Date.now() + 10 * 60 * 1000);
        await PdfDocument.findByIdAndUpdate(documentObjectId, {
          cooldownUntil: cooldownTime,
        });
        console.info(`[RAG] Maximum retries reached for documentId=${documentObjectId}. Entering cooldown until ${cooldownTime.toISOString()}.`);
      }
    }

    throw new Error(
      `[RAG] PDF ingestion failed for documentId=${documentObjectId}: ${error?.message ?? "Unknown error"}`,
    );
  }
};
