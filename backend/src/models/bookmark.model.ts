import mongoose, { Document, Schema, Types } from "mongoose";

export interface IBookmark extends Document {
  userId: Types.ObjectId;
  conversationId: Types.ObjectId;
  messageId: Types.ObjectId;
  type: "chat" | "notes";
  title: string;
  content: string;
  createdAt: Date;
}

const bookmarkSchema = new Schema<IBookmark>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true
    },

    messageId: {
      type: Schema.Types.ObjectId,
      ref: "Message",
      required: true
    },
    type: {
      type: String,
      enum: ["chat", "notes"],
      required: true
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Bookmark = mongoose.model<IBookmark>("Bookmark", bookmarkSchema);
