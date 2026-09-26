import mongoose, { Document, Schema } from "mongoose";

export interface ISessionManagementChallenge extends Document {
  user: mongoose.Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const sessionManagementChallengeSchema =
  new Schema<ISessionManagementChallenge>(
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      tokenHash: {
        type: String,
        required: true,
        unique: true,
        index: true,
      },

      expiresAt: {
        type: Date,
        required: true,
      },
    },
    {
      timestamps: true,
    }
  );

sessionManagementChallengeSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

export default mongoose.model<ISessionManagementChallenge>(
  "SessionManagementChallenge",
  sessionManagementChallengeSchema
);
