import express from "express";
import cors from "cors";
import videoRouter from "./routes/video.route.js";
import chatRouter from './routes/chat.route.js'
import authRouter from './routes/auth.route.js'
import cookieParser from 'cookie-parser'

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
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
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"]
}));

app.use(express.json());
app.use(cookieParser())

app.use("/api/v1/video", videoRouter);
app.use("/api/v1/chat", chatRouter);
app.use("/api/v1/user", authRouter)

app.get("/", (req, res) => {
  res.json({
    message: "Server is Running✅",
  });
});

export default app;
