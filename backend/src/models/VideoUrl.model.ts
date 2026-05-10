import mongoose, { Document, Schema } from "mongoose";

export interface IVideo extends Document {
  youtubeUrl: string;
  transcript: string;
  youtubeVideoId:string
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
    transcript: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Video = mongoose.model<IVideo>("Video", videoUrl);
