/**
 * The AI sometimes returns numbered lists inline without proper newlines, e.g.:
 *   "The requirements are: 1. First point 2. Second point 3. Third point"
 *
 * This prevents ReactMarkdown from rendering them as <ol> list items.
 * This utility detects that pattern and inserts the newlines markdown needs.
 *
 * It is careful NOT to touch:
 *   - Lines that start with markdown headings (# ## ###)
 *   - Lines that are already proper list items (starting with "N. ")
 *   - Numbers inside markdown heading lines like "### 1. Title"
 */
export function fixInlineLists(text: string): string {
  if (!text) return text;

  const lines = text.split('\n');
  const processed = lines.map((line) => {
    const trimmed = line.trimStart();

    // Skip blank lines
    if (!trimmed) return line;

    // Skip lines that are already markdown headings (# ## ###)
    // This prevents breaking "## Security Protocols" or "### 1. Title" headings
    if (/^#{1,6}\s/.test(trimmed)) return line;

    // Skip lines that already start with a proper list item ("1. " or "- ")
    if (/^(\d{1,2}\.|-|\*)\s/.test(trimmed)) return line;

    // Detect inline ordered lists — need at least 2 sequential numbered items
    const inlineListPattern = /\b(\d{1,2})\.\s+/g;
    const matches = [...line.matchAll(inlineListPattern)];

    if (matches.length < 2) return line;

    const firstMatch = matches[0];
    if (!firstMatch || firstMatch.index === undefined) return line;

    // Verify the numbers are sequential (1, 2, 3...)
    const numbers = matches.map((m) => parseInt(m[1]!, 10));
    const isSequential = numbers.every((n, i) => i === 0 || n === numbers[i - 1]! + 1);
    if (!isSequential) return line;

    // The characters right before the first number must not be '#'
    // (to avoid "### 1." type patterns, even if ## appears mid-line)
    const charBeforeFirst = line.slice(0, firstMatch.index).trimEnd();
    if (/#+$/.test(charBeforeFirst)) return line;

    // Split the line: everything before the first "N. " becomes the prefix
    const firstIdx = firstMatch.index;
    const prefix = line.slice(0, firstIdx).trimEnd();
    const listPart = line.slice(firstIdx);

    // Insert newlines before each "N. " after the first item
    const reformatted = listPart.replace(
      /(?<=\S[ \t]+)(\d{1,2})\.\s+/g,
      '\n$1. ',
    );

    return prefix ? `${prefix}\n${reformatted}` : reformatted;
  });

  return processed.join('\n');
}
