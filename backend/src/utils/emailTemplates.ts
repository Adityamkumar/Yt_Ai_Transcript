interface EmailTemplate {
  subject: string;
  html: string;
}

export const generateResetPasswordEmail = (
  resetLink: string,
  userName: string
): EmailTemplate => {
  const resetLinkWithoutProtocol = resetLink.replace(/^https?:\/\//, "");

  return {
    subject: "Reset your EchoMind AI password",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Password - EchoMind AI</title>
</head>
<body style="margin: 0; padding: 0; background-color: #050816; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <div style="width: 100%; background-color: #050816; padding: 28px 12px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 620px; margin: 0 auto;">
      <tr>
        <td style="text-align: center; padding: 20px 0 24px;">
          <div style="display: inline-block; background: linear-gradient(135deg, #7c5cff 0%, #4da2ff 100%); border-radius: 12px; padding: 10px 14px;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style="display: block;">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#ffffff"/>
            </svg>
          </div>
          <p style="margin: 12px 0 0; color: #f5f7ff; font-size: 22px; font-weight: 700;">EchoMind AI</p>
        </td>
      </tr>
      <tr>
        <td style="background: #0b1020; border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; box-shadow: 0 24px 60px rgba(0,0,0,0.45); padding: 30px 24px;">
          <h1 style="margin: 0 0 8px; color: #f5f7ff; font-size: 24px; line-height: 1.3;">Reset your password</h1>
          <p style="margin: 0 0 12px; color: #94a3b8; font-size: 14px; line-height: 1.7;">Hi ${userName || "there"},</p>
          <p style="margin: 0 0 24px; color: #94a3b8; font-size: 14px; line-height: 1.7;">
            We received a request to reset your EchoMind AI password. Use the button below to continue. This link expires in
            <strong style="color: #f5f7ff;"> 5 minutes</strong>.
          </p>
          <div style="text-align: center; margin: 0 0 24px;">
            <a href="${resetLink}" style="display: inline-block; padding: 13px 28px; border-radius: 10px; background: linear-gradient(135deg, #7c5cff 0%, #4da2ff 100%); color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none;">
              Reset Password
            </a>
          </div>
          <div style="border-top: 1px solid rgba(255,255,255,0.08); border-bottom: 1px solid rgba(255,255,255,0.08); padding: 16px 0; margin-bottom: 16px;">
            <p style="margin: 0 0 6px; color: #94a3b8; font-size: 12px;">If the button does not work, paste this link into your browser:</p>
            <p style="margin: 0; color: #7c5cff; font-size: 12px; word-break: break-all;">
              <a href="${resetLink}" style="color: #7c5cff; text-decoration: none;">${resetLinkWithoutProtocol}</a>
            </p>
          </div>
          <div style="background: rgba(124, 92, 255, 0.09); border: 1px solid rgba(124, 92, 255, 0.26); border-radius: 12px; padding: 14px; margin-bottom: 12px;">
            <p style="margin: 0 0 6px; color: #f5f7ff; font-size: 12px; font-weight: 600;">Link expiration notice</p>
            <p style="margin: 0; color: #94a3b8; font-size: 12px; line-height: 1.6;">This reset link is valid for 15 minutes and can only be used once.</p>
          </div>
          <div style="background: rgba(52, 168, 83, 0.1); border: 1px solid rgba(52, 168, 83, 0.24); border-radius: 12px; padding: 14px;">
            <p style="margin: 0 0 6px; color: #22c55e; font-size: 12px; font-weight: 600;">Security notice</p>
            <p style="margin: 0; color: #94a3b8; font-size: 12px; line-height: 1.6;">If you did not request this, you can ignore this email. Your account remains secure.</p>
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding: 20px 4px 6px; text-align: center;">
          <p style="margin: 0 0 8px; color: #94a3b8; font-size: 12px;">
            Need help? Contact our support team at <a href="mailto:support@echomind.ai" style="color: #7c5cff; text-decoration: none;">support@echomind.ai</a>
          </p>
          <p style="margin: 0; color: #94a3b8; font-size: 11px;">Copyright 2026 EchoMind AI. All rights reserved.</p>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
    `.trim(),
  };
};
