import axios from "axios";
import { Types } from "mongoose";
import { PdfChunk } from "../../models/pdfChunk.model.js";
import { PdfDocument } from "../../models/pdfDocument.model.js";
import { extractPdfText } from "../../utils/extractPdfText.js";
import { chunkPdfPagesForRag } from "../chunking/pdfChunking.service.js";
import { generateDocumentEmbeddings } from "../../ai/embedding.service.js";
import logger from "../../lib/logger.js";
import { RAG_CONFIG } from "../RagConfig/rag.config.js";

export type IngestPdfForRagInput = {
  pdfDocumentId: string | Types.ObjectId;
  title: string;
  fileName: string;
  fileUrl: string;
  fileId: string;
  uploadedBy: string | Types.ObjectId;
};

/** Number of automatic retries before requiring user intervention. */
export const MAX_AUTO_RETRIES = RAG_CONFIG.retries.MAX_AUTO_RETRIES;

/** Number of manual retries the user can trigger. */
export const MAX_MANUAL_RETRIES = RAG_CONFIG.retries.MAX_MANUAL_RETRIES;

/** Total retry budget (automatic + manual). Does not include the initial attempt. */
export const MAX_RETRY_COUNT =
  MAX_AUTO_RETRIES + MAX_MANUAL_RETRIES;

const toObjectId = (value: string | Types.ObjectId): Types.ObjectId =>
  typeof value === "string" ? new Types.ObjectId(value) : value;

const fetchPdfBufferFromUrl = async (fileUrl: string): Promise<Buffer> => {
  const response = await axios.get<ArrayBuffer>(fileUrl, {
    responseType: "arraybuffer",
  });
  return Buffer.from(response.data);
};

const EMBEDDING_BATCH_SIZE = RAG_CONFIG.embeddings.batchSize;


const generateEmbeddingsForChunks = async (
  chunks: Array<{
    text: string;
    chunkIndex: number;
    page: number;
    wordCount: number;
  }>,
  title: string,
): Promise<
  Array<{
    text: string;
    chunkIndex: number;
    page: number;
    wordCount: number;
    embedding: number[];
  }>
> => {
  const result: Array<{
    text: string;
    chunkIndex: number;
    page: number;
    wordCount: number;
    embedding: number[];
  }> = [];

  for (let i = 0; i < chunks.length; i += EMBEDDING_BATCH_SIZE) {
    const batch = chunks.slice(i, i + EMBEDDING_BATCH_SIZE);

    const texts = batch.map((chunk) => chunk.text);

    const embeddings = await generateDocumentEmbeddings(texts, title);

    const batchResults = batch.map((chunk, index) => {
      const embedding = embeddings[index];

      if (!embedding) {
        throw new Error(
          `Missing embedding for PDF chunk ${chunk.chunkIndex}`,
        );
      }

      return {
        ...chunk,
        embedding,
      };
    });

    result.push(...batchResults);
  }

  return result;
};





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

    await PdfDocument.findByIdAndUpdate(documentObjectId, {
      status: "ready",
      ragStatus: "ready",
      totalChunks: embeddedChunks.length,
      retryCount: 0,
      $unset: { cooldownUntil: "" },
    });

    logger.info(
      { documentId: documentObjectId, chunksCount: embeddedChunks.length },
      "[RAG] PDF ingestion complete"
    );
  } catch (error: any) {
    const updatedDoc = await PdfDocument.findByIdAndUpdate(
      documentObjectId,
      {
        status: "failed",
        ragStatus: "failed",
        $inc: { retryCount: 1 },
      },
      { returnDocument: 'after' }
    );

    await PdfChunk.deleteMany({ documentId: documentObjectId });

    if (updatedDoc) {
      if (updatedDoc.retryCount < MAX_AUTO_RETRIES) {
        logger.info({ documentId: documentObjectId, attempt: updatedDoc.retryCount + 1 }, "[RAG] Auto-retry ingestion");
        
        ingestPdfForRag({
          pdfDocumentId,
          title,
          fileName: _fileName,
          fileUrl,
          fileId: _fileId,
          uploadedBy: _uploadedBy,
        }).catch((err: Error) => {
          logger.error({ err, documentId: documentObjectId }, "[RAG] Background auto-retry ingestion failed");
        });
      } else if (updatedDoc.retryCount >= MAX_RETRY_COUNT) {
        const cooldownTime = new Date(Date.now() + 10 * 60 * 1000);
        await PdfDocument.findByIdAndUpdate(documentObjectId, {
          cooldownUntil: cooldownTime,
        });
        logger.warn({ documentId: documentObjectId, cooldownUntil: cooldownTime.toISOString() }, "[RAG] Maximum retries reached. Entering cooldown.");
      }
    }

    throw new Error(
      `[RAG] PDF ingestion failed for documentId=${documentObjectId}: ${error?.message ?? "Unknown error"}`,
    );
  }
};
