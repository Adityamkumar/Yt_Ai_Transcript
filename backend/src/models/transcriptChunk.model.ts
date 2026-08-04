import mongoose, { Document, Schema, Types } from "mongoose";
import { RAG_CONFIG } from "../rag/RagConfig/rag.config.js";
import type { TranscriptChunkFields } from "../types/ragChunk.types.js";

export interface ITranscriptChunk
  extends TranscriptChunkFields,
    Document {}

const validateEmbeddingDimensions = (embedding: number[]) =>
  embedding.length === RAG_CONFIG.embeddings.dimensions;

const transcriptChunkSchema = new Schema<ITranscriptChunk>(
  {
    videoDocumentId: {
      type: Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    embedding: {
      type: [Number],
      required: true,
      validate: {
        validator: validateEmbeddingDimensions,
        message: `Embedding must contain ${RAG_CONFIG.embeddings.dimensions} dimensions.`,
      },
    },
    start: {
      type: Number,
      required: true,
      min: 0,
    },
    end: {
      type: Number,
      required: true,
      min: 0,
    },
    duration: {
      type: Number,
      required: true,
      min: 0,
    },
    chunkIndex: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: "transcriptchunks",
  },
);

transcriptChunkSchema.index({ videoDocumentId: 1, chunkIndex: 1 }, { unique: true });
transcriptChunkSchema.index({ videoDocumentId: 1, start: 1 });

export const TranscriptChunk = mongoose.model<ITranscriptChunk>(
  "TranscriptChunk",
  transcriptChunkSchema,
);
