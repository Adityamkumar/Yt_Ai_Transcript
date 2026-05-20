import mongoose, { Document, Schema, Types } from "mongoose";

export interface IPdfChunk {
  text: string;
  chunkIndex: number;
  page: number;
  wordCount: number;
}

export interface IPdfDocument extends Document {
  title: string;
  fileName: string;
  fileUrl: string;
  fileId: string;
  pageCount: number;
  totalChunks: number;
  uploadedBy: Types.ObjectId;
  status: "processing" | "ready" | "failed";
  chunks: IPdfChunk[];
  createdAt: Date;
  updatedAt: Date;
}

const pdfChunkSubSchema = new Schema<IPdfChunk>({
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
});

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
    chunks: [pdfChunkSubSchema],
  },
  {
    timestamps: true,
  }
);

export const PdfDocument = mongoose.model<IPdfDocument>("PdfDocument", pdfDocumentSchema);

