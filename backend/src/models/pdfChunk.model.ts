import mongoose, { Document, Schema, Types } from "mongoose";

export interface IPdfChunk extends Document {
  documentId: Types.ObjectId;
  text: string;
  chunkIndex: number;
  page: number;
  wordCount: number;
  createdAt: Date;
}

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
    },
    chunkIndex: {
      type: Number,
      required: true,
    },
    page: {
      type: Number,
      required: true,
    },
    wordCount: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Index for fast query routing and search
pdfChunkSchema.index({ documentId: 1, chunkIndex: 1 });

export const PdfChunk = mongoose.model<IPdfChunk>("PdfChunk", pdfChunkSchema);
