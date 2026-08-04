import mongoose, { Document, Schema } from "mongoose";
import { RAG_CONFIG } from "../rag/RagConfig/rag.config.js";
import type { PdfChunkFields } from "../types/ragChunk.types.js";

export interface IPdfChunk extends PdfChunkFields, Document {}

const validateEmbeddingDimensions = (embedding: number[]) =>
  embedding.length === RAG_CONFIG.embeddings.dimensions;

const pdfChunkSchema = new Schema<IPdfChunk>(
  {
    documentId: {
      type: Schema.Types.ObjectId,
      ref: "PdfDocument",
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
    chunkIndex: {
      type: Number,
      required: true,
      min: 0,
    },
    page: {
      type: Number,
      required: true,
      min: 1,
    },
    wordCount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: "pdfchunks",
  }
);

pdfChunkSchema.index({ documentId: 1, chunkIndex: 1 }, { unique: true });
pdfChunkSchema.index({ documentId: 1, page: 1 });

export const PdfChunk = mongoose.model<IPdfChunk>("PdfChunk", pdfChunkSchema);

