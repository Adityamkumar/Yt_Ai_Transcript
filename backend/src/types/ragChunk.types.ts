import type { Types } from "mongoose";

export type VectorEmbedding = number[];

export interface BaseRagChunkFields {
  text: string;
  embedding: VectorEmbedding;
  chunkIndex: number;
  createdAt: Date;
}

export interface PdfChunkFields extends BaseRagChunkFields {
  documentId: Types.ObjectId;
  page: number;
  wordCount: number;
}

export interface TranscriptChunkFields extends BaseRagChunkFields {
  videoDocumentId: Types.ObjectId;
  start: number;
  end: number;
  duration: number;
}
