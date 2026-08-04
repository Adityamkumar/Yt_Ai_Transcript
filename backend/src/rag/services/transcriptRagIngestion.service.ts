import { Types } from "mongoose";
import { Video } from "../../models/VideoUrl.model.js";
import { TranscriptChunk } from "../../models/transcriptChunk.model.js";
import { chunkTranscriptForRag } from "../chunking/transcriptChunking.service.js";
import { generateDocumentEmbeddings } from "../../ai/embedding.service.js";
import { getTranscriptFromYoutube } from "../../services/transcript.service.js";
import logger from "../../lib/logger.js";
import { RAG_CONFIG } from "../RagConfig/rag.config.js";

export type IngestVideoForRagInput = {
  videoDocumentId: string | Types.ObjectId;
};

const toObjectId = (value: string | Types.ObjectId): Types.ObjectId =>
  typeof value === "string" ? new Types.ObjectId(value) : value;

const EMBEDDING_BATCH_SIZE = RAG_CONFIG.embeddings.batchSize;

const generateEmbeddingsForChunks = async (
  chunks: Array<{
    text: string;
    chunkIndex: number;
    start: number;
    end: number;
    duration: number;
  }>,
  title: string,
): Promise<
  Array<{
    text: string;
    chunkIndex: number;
    start: number;
    end: number;
    duration: number;
    embedding: number[];
  }>
> => {
  const result: Array<{
    text: string;
    chunkIndex: number;
    start: number;
    end: number;
    duration: number;
    embedding: number[];
  }> = [];

  for (let i = 0; i < chunks.length; i += EMBEDDING_BATCH_SIZE) {
    const batch = chunks.slice(i, i + EMBEDDING_BATCH_SIZE);

    // Extract all texts
    const texts = batch.map((chunk) => chunk.text);

    // One API request for the entire batch
    const embeddings = await generateDocumentEmbeddings(texts, title);
    // Merge embeddings back into chunks
     const batchResults = batch.map((chunk, index) => {
      const embedding = embeddings[index];

      if (!embedding) {
        throw new Error(
          `Missing embedding for Transcript chunk ${chunk.chunkIndex}`,
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

export const ingestVideoForRag = async ({
  videoDocumentId,
}: IngestVideoForRagInput): Promise<void> => {
  const videoObjectId = toObjectId(videoDocumentId);

  await Video.findByIdAndUpdate(videoObjectId, {
    status:'processing',
    ragStatus: "processing",
  });

  try {
    const video = await Video.findById(videoObjectId);
    if (!video) {
      throw new Error(`Video not found for id ${videoObjectId}`);
    }

    const transcript = await getTranscriptFromYoutube(video.youtubeVideoId);
    if (!transcript || transcript.length === 0) {
      throw new Error(
        `Failed to fetch transcript from YouTube for video id ${video.youtubeVideoId}`,
      );
    }

    const chunks = chunkTranscriptForRag(transcript);

    if (chunks.length === 0) {
      throw new Error(
        `No transcript chunks were generated for video "${video.title}".`,
      );
    }

    const embeddedChunks = await generateEmbeddingsForChunks(
      chunks,
      video.title,
    );

    await TranscriptChunk.deleteMany({ videoDocumentId: videoObjectId });

    await TranscriptChunk.insertMany(
      embeddedChunks.map((chunk) => ({
        videoDocumentId: videoObjectId,
        text: chunk.text,
        embedding: chunk.embedding,
        chunkIndex: chunk.chunkIndex,
        start: chunk.start,
        end: chunk.end,
        duration: chunk.duration,
      })),
    );

    await Video.findByIdAndUpdate(videoObjectId, {
      status:'ready',
      ragStatus: "ready",
      totalChunks: embeddedChunks.length,
    });

    logger.info(
      { videoDocumentId: videoObjectId, chunksCount: embeddedChunks.length },
      "[RAG] Video ingestion complete",
    );
  } catch (error: any) {
    await Video.findByIdAndUpdate(videoObjectId, {
      status:'failed',
      ragStatus: "failed",
    });

    await TranscriptChunk.deleteMany({ videoDocumentId: videoObjectId });

    throw new Error(
      `[RAG] Video ingestion failed for videoDocumentId=${videoObjectId}: ${error?.message ?? "Unknown error"}`,
    );
  }
};
