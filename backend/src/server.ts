import "dotenv/config.js";
import dns from "node:dns";
import app from "./app.js";
import connectDB from "./db/db.js";
import logger from "./lib/logger.js";

dns.setDefaultResultOrder('ipv4first')

const PORT = process.env.PORT || 8000

connectDB()

app.listen(PORT, ()=> logger.info(`Server is running on PORT: ${PORT}`))
