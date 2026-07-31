import { Types } from "mongoose";
import { Video } from "../../models/VideoUrl.model.js";
import { TranscriptChunk } from "../../models/transcriptChunk.model.js";
import { chunkTranscriptForRag } from "../chunking/transcriptChunking.service.js";
import { generateDocumentEmbeddingWithRetry } from "../utils/embeddingRetry.util.js";
import { getTranscriptFromYoutube } from "../../services/transcript.service.js";
import logger from "../../lib/logger.js";

export type IngestVideoForRagInput = {
  videoDocumentId: string | Types.ObjectId;
};

const toObjectId = (value: string | Types.ObjectId): Types.ObjectId =>
  typeof value === "string" ? new Types.ObjectId(value) : value;

const EMBEDDING_BATCH_SIZE = 5;
const EMBEDDING_BATCH_DELAY_MS = 200;

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const generateEmbeddingsForChunks = async (
  chunks: Array<{ text: string; chunkIndex: number; start: number; end: number; duration: number }>,
  title: string,
): Promise<Array<{ text: string; chunkIndex: number; start: number; end: number; duration: number; embedding: number[] }>> => {
  const result: Array<{ text: string; chunkIndex: number; start: number; end: number; duration: number; embedding: number[] }> = [];

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


export const ingestVideoForRag = async ({
  videoDocumentId,
}: IngestVideoForRagInput): Promise<void> => {
  const videoObjectId = toObjectId(videoDocumentId);

  
  await Video.findByIdAndUpdate(videoObjectId, {
    ragStatus: "processing",
  });

  try {
    const video = await Video.findById(videoObjectId);
    if (!video) {
      throw new Error(`Video not found for id ${videoObjectId}`);
    }

    
    const transcript = await getTranscriptFromYoutube(video.youtubeVideoId);
    if (!transcript || transcript.length === 0) {
      throw new Error(`Failed to fetch transcript from YouTube for video id ${video.youtubeVideoId}`);
    }

    
    const chunks = chunkTranscriptForRag(transcript);

    if (chunks.length === 0) {
      throw new Error(
        `No transcript chunks were generated for video "${video.title}".`,
      );
    }

    
    const embeddedChunks = await generateEmbeddingsForChunks(chunks, video.title);

    
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
      ragStatus: "ready",
      totalChunks: embeddedChunks.length,
    });

    logger.info(
      { videoDocumentId: videoObjectId, chunksCount: embeddedChunks.length },
      "[RAG] Video ingestion complete"
    );
  } catch (error: any) {
    
    await Video.findByIdAndUpdate(videoObjectId, {
      ragStatus: "failed",
    });

    
    await TranscriptChunk.deleteMany({ videoDocumentId: videoObjectId });

    throw new Error(
      `[RAG] Video ingestion failed for videoDocumentId=${videoObjectId}: ${error?.message ?? "Unknown error"}`,
    );
  }
};
