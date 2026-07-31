import mongoose from "mongoose";
import { configureDNS } from "../config/dns.js";
import logger from "../lib/logger.js";

configureDNS()
const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing");
  }
  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI);
    logger.info(`MongoDB connected !! DB HOST: ${connection.connection.host}`);
  } catch (error) {
    logger.error({ error }, "MONGODB connection error");
    process.exit(1);
  }
};

export default connectDB;
