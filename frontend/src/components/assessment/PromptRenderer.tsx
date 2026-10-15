/**
 * PromptRenderer — renders assessment prompt text that may contain fenced
 * Markdown code blocks (```lang ... ```) produced by the assessment generator.
 *
 * Rules:
 *  - Text outside code fences -> <p> elements (one per paragraph).
 *  - Fenced code blocks -> styled <pre><code> block (monospace, scrollable).
 *  - No execution sandbox. No external parser dependency.
 *  - Safe: content comes from the backend assessment generator, not user input.
 */

import type { ReactNode } from "react";

// Regex that captures fenced code blocks.
// Group 1: optional language tag (e.g. "javascript", "python", "")
// Group 2: code body
const FENCED_CODE_RE = /```(\w*)\n?([\s\S]*?)```/g;

interface Segment {
  type: "text" | "code";
  content: string;
  language?: string;
}

function splitSegments(raw: string): Segment[] {
  const segments: Segment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  FENCED_CODE_RE.lastIndex = 0;
  // eslint-disable-next-line no-cond-assign
  while ((match = FENCED_CODE_RE.exec(raw)) !== null) {
    const textBefore = raw.slice(lastIndex, match.index);
    if (textBefore.trim()) {
      segments.push({ type: "text", content: textBefore });
    }
    segments.push({ type: "code", language: match[1] || undefined, content: match[2] });
    lastIndex = match.index + match[0].length;
  }

  const remaining = raw.slice(lastIndex);
  if (remaining.trim()) {
    segments.push({ type: "text", content: remaining });
  }

  return segments.length > 0 ? segments : [{ type: "text", content: raw }];
}

function renderText(text: string, keyPrefix: string, large = true): ReactNode[] {
  return text
    .split(/\n\n+/)
    .filter((p) => p.trim())
    .map((paragraph, i) => (
      <p
        key={`${keyPrefix}-p-${i}`}
        className={
          large
            ? "text-base font-medium leading-7 text-[var(--text-primary)] sm:text-lg sm:leading-8 whitespace-pre-wrap"
            : "text-sm leading-6 text-[var(--text-primary)] whitespace-pre-wrap"
        }
      >
        {paragraph.trim()}
      </p>
    ));
}

function renderCodeBlock(code: string, language: string | undefined, key: string): ReactNode {
  const langLabel = language ? language.toLowerCase() : "";
  return (
    <div
      key={key}
      className="my-4 rounded-xl border border-[var(--border-medium)] bg-[var(--canvas)] overflow-hidden"
    >
      {langLabel && (
        <div className="px-4 py-1.5 border-b border-[var(--border-soft)] text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] select-none">
          {langLabel}
        </div>
      )}
      <pre className="overflow-x-auto px-4 py-3.5 text-sm leading-relaxed text-[var(--text-primary)] font-mono">
        <code>{code.trimEnd()}</code>
      </pre>
    </div>
  );
}

/**
 * renderPromptWithCode
 *
 * Returns a ReactNode for the question prompt string. Fenced code blocks become
 * styled pre/code elements; plain text is rendered as large heading-style paragraphs
 * matching the existing question display styling.
 */
export function renderPromptWithCode(prompt: string): ReactNode {
  const segments = splitSegments(prompt);

  if (segments.length === 1 && segments[0].type === "text") {
    // Fast path for the common non-code case.
    return (
      <p className="text-base font-medium leading-7 text-[var(--text-primary)] sm:text-lg sm:leading-8 whitespace-pre-wrap">
        {prompt.trim()}
      </p>
    );
  }

  const nodes: ReactNode[] = [];
  segments.forEach((seg, idx) => {
    const key = `seg-${idx}`;
    if (seg.type === "code") {
      nodes.push(renderCodeBlock(seg.content, seg.language, key));
    } else {
      nodes.push(...renderText(seg.content, key, true));
    }
  });

  return <>{nodes}</>;
}

/**
 * renderAnswerWithCode
 *
 * For displaying a user's free-text answer in the results review panel.
 * Uses smaller typography but the same code-block rendering.
 */
export function renderAnswerWithCode(answer: string): ReactNode {
  const segments = splitSegments(answer);

  if (segments.length === 1 && segments[0].type === "text") {
    return (
      <p className="text-sm leading-6 text-[var(--text-primary)] whitespace-pre-wrap">
        {answer.trim()}
      </p>
    );
  }

  const nodes: ReactNode[] = [];
  segments.forEach((seg, idx) => {
    const key = `ans-${idx}`;
    if (seg.type === "code") {
      nodes.push(renderCodeBlock(seg.content, seg.language, key));
    } else {
      nodes.push(...renderText(seg.content, key, false));
    }
  });

  return <>{nodes}</>;
}
