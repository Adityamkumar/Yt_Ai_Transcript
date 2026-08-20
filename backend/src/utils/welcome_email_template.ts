const escapeHtml = (value: string): string =>
    value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

// Hosted on ImageKit. ?tr=w-128,h-128,f-png requests a crisp 2x (128px)
// render for retina screens and forces PNG so older mail clients that
// choke on WebP/AVIF still get something they can display.
const DEFAULT_LOGO_URL =
    "https://ik.imagekit.io/qx2pw2swx/lumora-logo.png?tr=w-128,h-128,f-png";

export const welcomeEmailTemplate = (
    name: string,
    appUrl: string,
    logoUrl: string = DEFAULT_LOGO_URL,
): string => {
    const safeName = escapeHtml(name.trim() || "there");
    const safeAppUrl = escapeHtml(appUrl.replace(/\/$/, ""));
    const safeLogoUrl = escapeHtml(logoUrl);

    return `
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<meta name="x-apple-disable-message-reformatting" />
		<meta name="color-scheme" content="light" />
		<meta name="supported-color-schemes" content="light" />
		<title>Welcome to Lumora</title>
		<style>
			@media screen and (max-width: 600px) {
				.email-shell { width: 100% !important; }
				.card { border-radius: 0 !important; border-left: none !important; border-right: none !important; }
				.content { padding: 32px 24px !important; }
			}
		</style>
	</head>
	<body style="margin:0; padding:0; background-color:#f6f6f7; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; color:#1a1a1a;">
		<div style="display:none; max-height:0; overflow:hidden; opacity:0;">Your Lumora account is ready to go.</div>
		<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f6f6f7;">
			<tr>
				<td align="center" style="padding:40px 16px;">

					<table role="presentation" class="email-shell" width="560" cellpadding="0" cellspacing="0" border="0" style="width:560px; max-width:560px;">
						<tr>
							<td class="card" style="background-color:#ffffff; border:1px solid #e6e6e7; border-radius:12px; overflow:hidden;">

								<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">

									<tr>
										<td class="content" style="padding:36px 40px 0;">
											<table role="presentation" cellpadding="0" cellspacing="0" border="0">
												<tr>
													<td style="vertical-align:middle; padding-right:8px;">
														<img
															src="${safeLogoUrl}"
															alt="Lumora"
															width="24"
															height="24"
															style="display:block; width:24px; height:24px; border:0; outline:none; border-radius:6px;"
														/>
													</td>
													<td style="vertical-align:middle;">
														<span style="font-size:15px; font-weight:600; letter-spacing:-0.2px; color:#1a1a1a;">Lumora</span>
													</td>
												</tr>
											</table>
										</td>
									</tr>

									<tr>
										<td class="content" style="padding:28px 40px 0;">
											<h1 style="margin:0 0 22px; font-size:20px; line-height:26px; font-weight:700; letter-spacing:-0.3px; color:#1a1a1a;">Welcome to Lumora, ${safeName}</h1>
										</td>
									</tr>

									<tr>
										<td style="padding:0 40px;">
											<div style="border-top:1px solid #ececec;"></div>
										</td>
									</tr>

									<tr>
										<td class="content" style="padding:24px 40px 0;">
											<p style="margin:0 0 20px; font-size:14px; line-height:22px; color:#4a4a4a;">Your account is live. Lumora gives you one place to turn what you watch and read &mdash; videos, articles, PDFs &mdash; into understanding you actually keep.</p>

											<p style="margin:0 0 8px; font-size:13px; line-height:20px; font-weight:600; color:#8a8a8a; text-transform:uppercase; letter-spacing:0.4px;">Getting started</p>

											<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px;">
												<tr>
													<td style="padding:0 0 10px; font-size:14px; line-height:21px; color:#1a1a1a; vertical-align:top;">
														<span style="color:#a6512f; font-weight:600;">1.</span>&nbsp; Add your first source &mdash; a video link or a document
													</td>
												</tr>
												<tr>
													<td style="padding:0 0 10px; font-size:14px; line-height:21px; color:#1a1a1a; vertical-align:top;">
														<span style="color:#a6512f; font-weight:600;">2.</span>&nbsp; Ask it a question and see how Lumora responds
													</td>
												</tr>
												<tr>
													<td style="padding:0; font-size:14px; line-height:21px; color:#1a1a1a; vertical-align:top;">
														<span style="color:#a6512f; font-weight:600;">3.</span>&nbsp; Save what's useful so it's there when you need it again
													</td>
												</tr>
											</table>
										</td>
									</tr>

									<tr>
										<td style="padding:0 40px;">
											<div style="border-top:1px solid #ececec;"></div>
										</td>
									</tr>

									<tr>
										<td class="content" style="padding:24px 40px 0;">
											<table role="presentation" cellpadding="0" cellspacing="0" border="0">
												<tr>
													<td style="border-radius:6px; background-color:#a6512f;">
														<a href="${safeAppUrl}/app" target="_blank" style="display:inline-block; padding:10px 20px; font-size:14px; font-weight:600; color:#ffffff; text-decoration:none; border-radius:6px;">Open Lumora</a>
													</td>
												</tr>
											</table>
										</td>
									</tr>

									<tr>
										<td class="content" style="padding:20px 40px 0;">
											<p style="margin:0; font-size:13px; line-height:20px; color:#8a8a8a;">If you have any questions along the way, just reply to this email &mdash; it reaches our team directly, not a bot.</p>
										</td>
									</tr>

									<tr>
										<td style="padding:24px 40px 0;">
											<div style="border-top:1px solid #ececec;"></div>
										</td>
									</tr>

									<tr>
										<td class="content" style="padding:20px 40px 32px;">
											<p style="margin:0; font-size:12px; line-height:18px; color:#a3a3a3;">You're receiving this because an account was created at Lumora with this email address.</p>
										</td>
									</tr>

								</table>
							</td>
						</tr>
					</table>

					<table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="width:560px; max-width:560px;">
						<tr>
							<td align="center" style="padding:20px 0 0;">
								<p style="margin:0; font-size:12px; line-height:18px; color:#a3a3a3;">&copy; ${new Date().getFullYear()} Lumora, Inc.</p>
							</td>
						</tr>
					</table>

				</td>
			</tr>
		</table>
	</body>
</html>`;
};
