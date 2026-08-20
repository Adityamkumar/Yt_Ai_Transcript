import { userEvent } from "./user.events.js";
import { sendEmail } from "../utils/sendEmail.js";
import { welcomeEmailTemplate } from "../utils/welcome_email_template.js";
import logger from "../lib/logger.js";

const frontendUrl =
  process.env.NODE_ENV === "production"
    ? process.env.FRONTEND_CLOUDFLARE_URL
    : "http://localhost:5173";

userEvent.on("user.created", async (user) => {
  logger.info("Welcome Email Sent...")
  await sendEmail({
    to: user.email,
    subject: "Welcome to Lumora",
    html: welcomeEmailTemplate(user.name, frontendUrl!),
  });
});