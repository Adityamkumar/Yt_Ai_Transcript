import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";

interface IUserPreferences {
  responseLanguage: "en" | "hi" | "ta" | "te" | "kn" | "ml" | "bn" | "mr";
}

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  avatar?: string;
  googleId?: string;
  provider: "local" | "google";
  resetPasswordToken?: string;
  resetPasswordExpiry?: Date;
  preferences: IUserPreferences;
  isEmailVerified: Boolean;
  emailVerificationToken: string | undefined;
  emailVerificationExpiry: Date | undefined;
  verificationExpiresAt:Date;
  isPasswordCorrect(password: string): Promise<boolean>;
  generateAccessToken(sessionId:string): string;
  generateRefreshToken(): string;
  generateResetPasswordToken(): string;
  generateTemporaryToken():{
     unHashedToken:string,
     hashedToken: string;
     tokenExpiry: Date;
  };
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: function (this: any) {
        return this.provider === "local";
      },
    },
    googleId: {
      type: String,
    },
    avatar: {
      type: String,
      default: "",
    },
    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpiry: {
      type: Date,
    },
    preferences: {
      responseLanguage: {
        type: String,
        enum: ["en", "hi", "ta", "te", "kn", "ml", "bn", "mr"],
        default: "en",
      },
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
    },

    emailVerificationExpiry: {
      type: Date,
    },
    verificationExpiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);


userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const hashed = await bcrypt.hash(this.password as string, 10);
  this.password = hashed;
});

userSchema.methods.isPasswordCorrect = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function (sessionId:string) {
  return jwt.sign(
    {
      _id: this._id,
      sessionId,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY as any,
    },
  );
};
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET!,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY as any,
    },
  );
};

userSchema.methods.generateResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpiry = Date.now() + 5 * 60 * 1000;

  return resetToken;
};

userSchema.methods.generateTemporaryToken = function (){
  const unHashedToken = crypto.randomBytes(20).toString("hex");

  const hashedToken = crypto
    .createHash("sha256")
    .update(unHashedToken)
    .digest("hex");

  const tokenExpiry = Date.now() + 15 * 60 * 1000; //15min
  return { unHashedToken, hashedToken, tokenExpiry };
};

userSchema.index(
  {
    verificationExpiresAt: 1
  },
  {
    expireAfterSeconds: 0,
    partialFilterExpression:{
      isEmailVerified: false,
    }
  }
)

const User = mongoose.model<IUser>("User", userSchema);

export default User;
