import mongoose, {Document, Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from 'node:crypto'

export interface IUser extends Document{
   name: string;
   email: string;
   password?: string;
   avatar?:string;
   googleId?:string;
   provider: 'local' | 'google'
   refreshToken?: string[];
   resetPasswordToken?: string;
   resetPasswordExpiry?: Date;
   isPasswordCorrect(
     password: string
   ): Promise<boolean>;
   generateAccessToken(): string;
   generateRefreshToken(): string;
   generateResetPasswordToken(): string;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: {
      type: String,
      required: function (this: any) {
        return this.provider === 'local';
      },
    },
    googleId:{
      type: String
    },
    avatar:{
      type:String,
      default: ""
    },
    provider:{
      type:String,
      enum:['local', 'google'],
      default: 'local'
    },
    refreshToken: { type: [String], default: [] },
    resetPasswordToken:{
      type: String
    },
    resetPasswordExpiry:{
      type: Date
    }
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

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
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

userSchema.methods.generateResetPasswordToken =
function () {

  const resetToken =
    crypto.randomBytes(32).toString("hex");

  this.resetPasswordToken =
    crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

  this.resetPasswordExpiry =
    Date.now() + 5 * 60 * 1000;

  return resetToken;
};
const User = mongoose.model<IUser>("User", userSchema);

export default User;
