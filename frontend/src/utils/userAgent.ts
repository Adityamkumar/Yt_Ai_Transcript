export function parseUserAgent(userAgent?: string): string {
  if (!userAgent || typeof userAgent !== 'string' || !userAgent.trim()) {
    return 'Unknown Device';
  }

  const ua = userAgent.trim();

  // Detect browser
  let browser = '';
  if (/edg([ea]|ios)?\//i.test(ua)) {
    browser = 'Edge';
  } else if (/opr\/|opera/i.test(ua)) {
    browser = 'Opera';
  } else if (/samsungbrowser/i.test(ua)) {
    browser = 'Samsung Internet';
  } else if (/chrome|crios/i.test(ua) && !/edg/i.test(ua)) {
    browser = 'Chrome';
  } else if (/firefox|fxios/i.test(ua)) {
    browser = 'Firefox';
  } else if (/safari/i.test(ua) && !/chrome|crios|android/i.test(ua)) {
    browser = 'Safari';
  }

  // Detect OS / Device
  let os = '';
  if (/iphone/i.test(ua)) {
    os = 'iPhone';
  } else if (/ipad/i.test(ua)) {
    os = 'iPad';
  } else if (/android/i.test(ua)) {
    os = 'Android';
  } else if (/windows nt/i.test(ua)) {
    os = 'Windows';
  } else if (/macintosh|mac os x/i.test(ua)) {
    os = 'macOS';
  } else if (/cros/i.test(ua)) {
    os = 'ChromeOS';
  } else if (/linux/i.test(ua)) {
    os = 'Linux';
  }

  if (browser && os) {
    return `${browser} on ${os}`;
  }
  if (browser) {
    return browser;
  }
  if (os) {
    return os;
  }

  return ua.length > 35 ? `${ua.slice(0, 32)}...` : ua;
}
