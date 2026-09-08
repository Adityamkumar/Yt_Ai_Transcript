import fs from "node:fs";
import path from "node:path";
import { extractEmailDomain } from "../utils/email.util.js";

function loadDomains(fileName: string): Set<string> {
  const filePath = path.join(
    process.cwd(),
    "src",
    "data",
    fileName,
  );

  const content = fs.readFileSync(filePath, "utf8");

  return new Set(
    content
      .split(/\r?\n/)
      .map((domain) => domain.trim().toLowerCase())
      .filter(Boolean),
  );
}

const allowedDomains = loadDomains("allowed-domains.txt");

const disposableDomains = loadDomains("domains.txt");

export function isDisposableDomain(domain: string): boolean {
  return disposableDomains.has(domain);
}

export type EmailDomainCheckResult =
  | {
      status: "allow";
      domain: string;
      source: "allowed";
    }
  | {
      status: "reject";
      domain: string;
      source: "disposable";
    }
  | {
      status: "unknown";
      domain: string;
      source: "unknown";
    };

export function checkEmailDomain(
  email: string,
): EmailDomainCheckResult {
  const domain = extractEmailDomain(email);

  if (allowedDomains.has(domain)) {
    return {
      status: "allow",
      domain,
      source: "allowed",
    };
  }

  if (disposableDomains.has(domain)) {
    return {
      status: "reject",
      domain,
      source: "disposable",
    };
  }

  return {
    status: "unknown",
    domain,
    source: "unknown",
  };
}