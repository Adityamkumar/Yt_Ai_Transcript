import mongoose, { Document, Schema, Types } from "mongoose";

export interface ITranscriptChunk {
  text: string;
  start: number;
  end: number;
  duration: number;
}

export interface IVideo extends Document {
  youtubeUrl: string;
  title: string;
  youtubeVideoId: string;
  uploadedBy?: Types.ObjectId;
  totalChunks: number;
  status: "processing" | "ready" | "failed";
  ragStatus?: "processing" | "ready" | "failed";
  createdAt: Date;
  updatedAt: Date;
}

const videoUrl = new Schema<IVideo>(
  {
    youtubeUrl: {
      type: String,
      required: true,
    },
    youtubeVideoId: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    totalChunks: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["processing", "ready", "failed"],
      default: "ready",
      required: true,
    },
    ragStatus: {
      type: String,
      enum: ["processing", "ready", "failed"],
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

export const Video = mongoose.model<IVideo>("Video", videoUrl);

