import mongoose, { Document, Schema, Types } from "mongoose";

export interface IMessage extends Document {
  conversationId: Types.ObjectId;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "assistant"],
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

export const Message = mongoose.model<IMessage>("Message", messageSchema);
