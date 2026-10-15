import mongoose, { Document, Schema, Types } from "mongoose";

export interface ISourceAccess extends Document {
  userId: Types.ObjectId;
  sourceType: "video" | "pdf";
  sourceId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const sourceAccessSchema = new Schema<ISourceAccess>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sourceType: {
      type: String,
      enum: ["video", "pdf"],
      required: true,
    },
    sourceId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
  },
  { timestamps: true },
);

sourceAccessSchema.index(
  { userId: 1, sourceType: 1, sourceId: 1 },
  { unique: true },
);

export const SourceAccess = mongoose.model<ISourceAccess>(
  "SourceAccess",
  sourceAccessSchema,
);