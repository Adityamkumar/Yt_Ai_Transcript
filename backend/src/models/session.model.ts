import mongoose, { Schema, Document } from "mongoose";

export interface ISession extends Document {
  user: mongoose.Types.ObjectId;
  refreshTokenHash: string;
  userAgent?: string;
  ipAddress?: string;
  provider: "local" | "google";
  expiresAt: Date;
  revokedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const SESSION_RETENTION_TTL = 60 * 60 * 24;

const sessionSchema = new Schema<ISession>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    refreshTokenHash: {
      type: String,
      required: true,
    },

    userAgent: {
      type: String,
      default: null,
    },

    ipAddress: {
      type: String,
      default: null,
    },

    provider: {
      type: String,
      enum: ["local", "google"],
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    revokedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);


sessionSchema.index(
  { expiresAt: 1 },
  {
    expireAfterSeconds: SESSION_RETENTION_TTL,
    name: "expiresAt_ttl",
  }
);

sessionSchema.index(
  { revokedAt: 1 },
  {
    expireAfterSeconds: SESSION_RETENTION_TTL,
    name: "revokedAt_ttl",
  }
);


const Session = mongoose.model<ISession>("Session", sessionSchema);
export default Session