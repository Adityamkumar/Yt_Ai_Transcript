import { userEvent } from "./user.events.js";
import { sendEmail } from "../utils/sendEmail.js";
import { emailVerificationTemplate } from "../utils/email_verification_template.js";
import logger from "../lib/logger.js";

const frontendUrl =
    process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_CLOUDFLARE_URL
        : "http://localhost:5173";

userEvent.on("user.verification.requested", async (user) => {
    try {
        const verificationLink =
            `${frontendUrl}/verify-email/${user.verificationToken}`;

        await sendEmail({
            to: user.email,
            subject: "Verify your Lumora email",
            html: emailVerificationTemplate(
                user.name,
                user.email,
                verificationLink,
            ),
        });

        logger.info(
            `Verification email sent to ${user.email}`,
        );
    } catch (error) {
        logger.error(
            `Failed to send verification email to ${user.email}: ${
                error instanceof Error ? error.message : String(error)
            }`,
        );
    }
});
