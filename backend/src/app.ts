import express from "express";
import cors from "cors";
import videoRouter from "./routes/video.route.js";
import chatRouter from './routes/chat.route.js'
import authRouter from './routes/auth.route.js'
import conversationRouter from './routes/conversation.route.js'
import messageRouter from './routes/message.route.js'
import bookmarkRouter from './routes/bookmark.route.js'
import pdfRouter from './routes/pdf.route.js'
import cookieParser from 'cookie-parser'
import passport from "./config/passport.js";

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_PROD_URL
];

const isLocalOrigin = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname;
    return (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(hostname)
    );
  } catch {
    return false;
  }
};

const isVercelOrigin = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname;
    return hostname.endsWith('.vercel.app') && hostname.includes('echomind');
  } catch {
    return false;
  }
};

app.use(cors({
  origin: function (origin, callback) {
    if (
      !origin || 
      allowedOrigins.indexOf(origin) !== -1 || 
      isVercelOrigin(origin) ||
      (process.env.NODE_ENV === 'development' && isLocalOrigin(origin))
    ) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"]
}));

app.use(express.json());
app.use(cookieParser())
app.use(passport.initialize())

app.use("/api/v1/video", videoRouter);
app.use("/api/v1/chat", chatRouter);
app.use("/api/v1/user", authRouter)
app.use("/api/v1/conversations",conversationRouter);
app.use("/api/v1/messages",messageRouter);
app.use("/api/v1/bookmarks", bookmarkRouter)
app.use("/api/v1/pdf", pdfRouter);


app.use((err: any, req: any, res: any, next: any) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors: err.errors || []
  });
});

app.get("/health", (_, res) => {
  res.status(200).json({
    status: "ok",
    message: "EchoMind backend running"
  });
});

export default app;

