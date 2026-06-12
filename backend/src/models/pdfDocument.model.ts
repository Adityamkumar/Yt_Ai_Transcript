import mongoose, { Document, Schema, Types } from "mongoose";

export interface IPdfDocument extends Document {
  title: string;
  fileName: string;
  fileUrl: string;
  fileId: string;
  /** SHA-256 hash of the raw PDF bytes — used for deduplication */
  documentHash: string;
  pageCount: number;
  totalChunks: number;
  uploadedBy: Types.ObjectId;
  status: "processing" | "ready" | "failed";
  ragStatus?: "processing" | "ready" | "failed";
  /**
   * Tracks how many automatic ingestion attempts have been made.
   * Auto-retries are capped at MAX_AUTO_RETRIES (2).
   * Manual retries are tracked separately via retryCount as well (total cap = 4).
   */
  retryCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const pdfDocumentSchema = new Schema<IPdfDocument>(
  {
    title: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileId: {
      type: String,
      required: true,
    },
    documentHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    pageCount: {
      type: Number,
      required: true,
      default: 0,
    },
    totalChunks: {
      type: Number,
      required: true,
      default: 0,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["processing", "ready", "failed"],
      default: "processing",
      required: true,
    },
    ragStatus: {
      type: String,
      enum: ["processing", "ready", "failed"],
      required: false,
    },
    retryCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const PdfDocument = mongoose.model<IPdfDocument>("PdfDocument", pdfDocumentSchema);
