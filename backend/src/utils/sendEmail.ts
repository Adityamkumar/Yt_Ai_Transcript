import { BrevoClient } from "@getbrevo/brevo";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY!,
});

export const sendEmail = async ({ to, subject, html }: EmailOptions):Promise<void> => {
  try {
    const result = await brevo.transactionalEmails.sendTransacEmail({
      sender: {
        name: process.env.BREVO_SENDER_NAME || "Lumora",
        email: process.env.BREVO_SENDER_EMAIL!,
      },
      to: [
        {
          email: to,
        },
      ],
      subject,
      htmlContent: html,
    });

    console.log("Brevo email sent:", result.messageId);
  } catch (error) {
    console.error("Brevo email error:", error);
    throw new Error("Failed to send email");
  }
};
