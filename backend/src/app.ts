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

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
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

