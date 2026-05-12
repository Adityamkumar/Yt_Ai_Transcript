import mongoose, { Document, Schema, Types } from "mongoose";

export interface IConversation extends Document {
  userId: Types.ObjectId;
  videoId: Types.ObjectId;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    videoId: {
      type: Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Conversation = mongoose.model<IConversation>("Conversation", conversationSchema);
