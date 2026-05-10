import express from "express";
import cors from "cors";
import videoRouter from "./routes/video.route.js";
import chatRouter from './routes/chat.route.js'

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1/video", videoRouter);
app.use("/api/v1/chat", chatRouter)

app.get("/", (req, res) => {
  res.json({
    message: "Server is Running✅",
  });
});

export default app;
