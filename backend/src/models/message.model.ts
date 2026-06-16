import mongoose, { Document, Schema, Types } from "mongoose";

export interface IMessage extends Document {
  conversationId: Types.ObjectId;
  role: "user" | "assistant";
  type: "chat" | "notes" | "summary";
  content: string;
  suggestedQuestions?: string[];
  source?: "user" | "suggested_question";
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
    type: {
      type: String,
      enum: ["chat", "notes", "summary"],
      default: "chat",
    },
    content: {
      type: String,
      required: true,
    },
    suggestedQuestions: {
      type: [String],
      default: undefined,
    },
    source: {
      type: String,
      enum: ["user", "suggested_question"],
      default: undefined,
    },
  },
  {
    timestamps: true,
  },
);

export const Message = mongoose.model<IMessage>("Message", messageSchema);

