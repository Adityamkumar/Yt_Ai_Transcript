const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

// Hosted on ImageKit.
// ?tr=w-128,h-128,f-png requests a crisp 2x (128px)
// render for retina screens and forces PNG compatibility.
const DEFAULT_LOGO_URL =
  "https://ik.imagekit.io/qx2pw2swx/lumora-logo.png?tr=w-128,h-128,f-png";

const LINK_EXPIRY_MINUTES = 15;

export const emailVerificationTemplate = (
  name: string,
  email: string,
  verificationLink: string,
  logoUrl: string = DEFAULT_LOGO_URL,
): string => {
  const safeName = escapeHtml(name.trim() || "there");
  const safeEmail = escapeHtml(email.trim());
  const safeVerificationLink = escapeHtml(verificationLink);
  const safeLogoUrl = escapeHtml(logoUrl);

  const verificationLinkWithoutProtocol = escapeHtml(
    verificationLink.replace(/^https?:\/\//, ""),
  );

  return `
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
        />
        <meta name="x-apple-disable-message-reformatting" />
        <meta name="color-scheme" content="light" />
        <meta
            name="supported-color-schemes"
            content="light"
        />

        <title>Verify your Lumora email</title>

        <style>
            @media screen and (max-width: 600px) {
                .email-shell {
                    width: 100% !important;
                }

                .card {
                    border-radius: 0 !important;
                    border-left: none !important;
                    border-right: none !important;
                }

                .content {
                    padding: 32px 24px !important;
                }
            }
        </style>
    </head>

    <body
        style="
            margin:0;
            padding:0;
            background-color:#f6f6f7;
            font-family:-apple-system, BlinkMacSystemFont,
                'Segoe UI', Helvetica, Arial, sans-serif;
            color:#1a1a1a;
        "
    >
        <!-- Preview text -->
        <div
            style="
                display:none;
                max-height:0;
                overflow:hidden;
                opacity:0;
            "
        >
            Verify your Lumora email address.
            This link expires in ${LINK_EXPIRY_MINUTES} minutes.
        </div>

        <table
            role="presentation"
            width="100%"
            cellpadding="0"
            cellspacing="0"
            border="0"
            style="background-color:#f6f6f7;"
        >
            <tr>
                <td align="center" style="padding:40px 16px;">

                    <table
                        role="presentation"
                        class="email-shell"
                        width="560"
                        cellpadding="0"
                        cellspacing="0"
                        border="0"
                        style="
                            width:560px;
                            max-width:560px;
                        "
                    >
                        <tr>
                            <td
                                class="card"
                                style="
                                    background-color:#ffffff;
                                    border:1px solid #e6e6e7;
                                    border-radius:12px;
                                    overflow:hidden;
                                "
                            >

                                <table
                                    role="presentation"
                                    width="100%"
                                    cellpadding="0"
                                    cellspacing="0"
                                    border="0"
                                >

                                    <!-- Logo -->
                                    <tr>
                                        <td
                                            class="content"
                                            style="padding:36px 40px 0;"
                                        >
                                            <table
                                                role="presentation"
                                                cellpadding="0"
                                                cellspacing="0"
                                                border="0"
                                            >
                                                <tr>
                                                    <td
                                                        style="
                                                            vertical-align:middle;
                                                            padding-right:8px;
                                                        "
                                                    >
                                                        <img
                                                            src="${safeLogoUrl}"
                                                            alt="Lumora"
                                                            width="24"
                                                            height="24"
                                                            style="
                                                                display:block;
                                                                width:24px;
                                                                height:24px;
                                                                border:0;
                                                                outline:none;
                                                                border-radius:6px;
                                                            "
                                                        />
                                                    </td>

                                                    <td
                                                        style="
                                                            vertical-align:middle;
                                                        "
                                                    >
                                                        <span
                                                            style="
                                                                font-size:15px;
                                                                font-weight:600;
                                                                letter-spacing:-0.2px;
                                                                color:#1a1a1a;
                                                            "
                                                        >
                                                            Lumora
                                                        </span>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>

                                    <!-- Greeting and purpose -->
                                    <tr>
                                        <td
                                            class="content"
                                            style="padding:28px 40px 0;"
                                        >
                                            <p
                                                style="
                                                    margin:0 0 18px;
                                                    font-size:16px;
                                                    line-height:22px;
                                                    font-weight:600;
                                                    color:#1a1a1a;
                                                "
                                            >
                                                Hi ${safeName},
                                            </p>
                                            <h1
                                                style="
                                                    margin:0 0 6px;
                                                    font-size:20px;
                                                    line-height:26px;
                                                    font-weight:700;
                                                    letter-spacing:-0.3px;
                                                    color:#1a1a1a;
                                                "
                                            >
                                                Verify your email address
                                            </h1>
                                            <p
                                                style="
                                                    margin:0;
                                                    font-size:14px;
                                                    line-height:22px;
                                                    color:#8a8a8a;
                                                "
                                            >
                                                ${safeEmail}
                                            </p>
                                        </td>
                                    </tr>

                                    <!-- Divider -->
                                    <tr>
                                        <td style="padding:0 40px;">
                                            <div
                                                style="
                                                    border-top:1px solid #ececec;
                                                "
                                            ></div>
                                        </td>
                                    </tr>

                                    <!-- Message -->
                                    <tr>
                                        <td
                                            class="content"
                                            style="padding:24px 40px 0;"
                                        >
                                            <p
                                                style="
                                                    margin:0 0 20px;
                                                    font-size:14px;
                                                    line-height:22px;
                                                    color:#4a4a4a;
                                                "
                                            >
                                                Click the button below to verify
                                                that this email address belongs
                                                to your Lumora account. This link
                                                expires in
                                                <strong
                                                    style="color:#1a1a1a;"
                                                >
                                                    ${LINK_EXPIRY_MINUTES} minutes
                                                </strong>
                                                and can only be used once.
                                            </p>
                                        </td>
                                    </tr>

                                    <!-- Button -->
                                    <tr>
                                        <td
                                            class="content"
                                            style="padding:0 40px 24px;"
                                        >
                                            <table
                                                role="presentation"
                                                cellpadding="0"
                                                cellspacing="0"
                                                border="0"
                                            >
                                                <tr>
                                                    <td
                                                        style="
                                                            border-radius:6px;
                                                            background-color:#a6512f;
                                                        "
                                                    >
                                                        <a
                                                            href="${safeVerificationLink}"
                                                            target="_blank"
                                                            style="
                                                                display:inline-block;
                                                                padding:10px 20px;
                                                                font-size:14px;
                                                                font-weight:600;
                                                                color:#ffffff;
                                                                text-decoration:none;
                                                                border-radius:6px;
                                                            "
                                                        >
                                                            Verify Email
                                                        </a>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>

                                    <!-- Fallback link -->
                                    <tr>
                                        <td
                                            class="content"
                                            style="padding:0 40px 24px;"
                                        >
                                            <p
                                                style="
                                                    margin:0 0 6px;
                                                    font-size:12px;
                                                    line-height:18px;
                                                    color:#8a8a8a;
                                                "
                                            >
                                                If the button doesn't work,
                                                paste this link into your
                                                browser:
                                            </p>

                                            <p
                                                style="
                                                    margin:0;
                                                    font-size:12px;
                                                    line-height:18px;
                                                    word-break:break-all;
                                                "
                                            >
                                                <a
                                                    href="${safeVerificationLink}"
                                                    target="_blank"
                                                    style="
                                                        color:#a6512f;
                                                        text-decoration:none;
                                                    "
                                                >
                                                    ${verificationLinkWithoutProtocol}
                                                </a>
                                            </p>
                                        </td>
                                    </tr>

                                    <!-- Divider -->
                                    <tr>
                                        <td style="padding:0 40px;">
                                            <div
                                                style="
                                                    border-top:1px solid #ececec;
                                                "
                                            ></div>
                                        </td>
                                    </tr>

                                    <!-- Security message -->
                                    <tr>
                                        <td
                                            class="content"
                                            style="padding:24px 40px 0;"
                                        >
                                            <p
                                                style="
                                                    margin:0 0 4px;
                                                    font-size:13px;
                                                    line-height:20px;
                                                    font-weight:600;
                                                    color:#1a1a1a;
                                                "
                                            >
                                                Didn't create this account?
                                            </p>

                                            <p
                                                style="
                                                    margin:0;
                                                    font-size:13px;
                                                    line-height:20px;
                                                    color:#8a8a8a;
                                                "
                                            >
                                                You can safely ignore this
                                                email. The account will remain
                                                inactive until the email
                                                address is verified.
                                            </p>
                                        </td>
                                    </tr>

                                    <!-- Divider -->
                                    <tr>
                                        <td style="padding:24px 40px 0;">
                                            <div
                                                style="
                                                    border-top:1px solid #ececec;
                                                "
                                            ></div>
                                        </td>
                                    </tr>

                                    <!-- Footer -->
                                    <tr>
                                        <td
                                            class="content"
                                            style="
                                                padding:20px 40px 32px;
                                            "
                                        >
                                            <p
                                                style="
                                                    margin:0 0 8px;
                                                    font-size:12px;
                                                    line-height:18px;
                                                    color:#a3a3a3;
                                                "
                                            >
                                                Need help?
                                                Contact us at
                                                <a
                                                    href="mailto:support@lumora.ai"
                                                    style="
                                                        color:#a6512f;
                                                        text-decoration:none;
                                                    "
                                                >
                                                    support@lumora.ai
                                                </a>
                                            </p>

                                            <p
                                                style="
                                                    margin:0;
                                                    font-size:12px;
                                                    line-height:18px;
                                                    color:#a3a3a3;
                                                "
                                            >
                                                You're receiving this because
                                                an account was created at
                                                Lumora using this email
                                                address.
                                            </p>
                                        </td>
                                    </tr>

                                </table>

                            </td>
                        </tr>
                    </table>

                    <!-- Copyright -->
                    <table
                        role="presentation"
                        width="560"
                        cellpadding="0"
                        cellspacing="0"
                        border="0"
                        style="
                            width:560px;
                            max-width:560px;
                        "
                    >
                        <tr>
                            <td
                                align="center"
                                style="padding:20px 0 0;"
                            >
                                <p
                                    style="
                                        margin:0;
                                        font-size:12px;
                                        line-height:18px;
                                        color:#a3a3a3;
                                    "
                                >
                                    &copy;
                                    ${new Date().getFullYear()}
                                    Lumora, Inc.
                                </p>
                            </td>
                        </tr>
                    </table>

                </td>
            </tr>
        </table>
    </body>
</html>
`.trim();
};
