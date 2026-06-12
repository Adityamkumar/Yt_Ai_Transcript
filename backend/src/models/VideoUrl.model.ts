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
  transcript: ITranscriptChunk[];
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
      required: false,
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
    transcript: [
      {
        text: { type: String, required: true },
        start: { type: Number, required: true },
        end: {
          type: Number,
          required: false,
          default: function (this: { start?: number; duration?: number }) {
            const start = typeof this.start === "number" ? this.start : 0;
            const duration = typeof this.duration === "number" ? this.duration : 0;
            return start + duration;
          },
        },
        duration: { type: Number, required: true },
      },
    ],
  },
  {
    timestamps: true,
  },
);

export const Video = mongoose.model<IVideo>("Video", videoUrl);

