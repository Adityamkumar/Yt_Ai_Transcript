











export function fixInlineLists(text: string): string {
  if (!text) return text;

  const lines = text.split('\n');
  const processed = lines.map((line) => {
    const trimmed = line.trimStart();

    
    if (!trimmed) return line;

    
    
    if (/^#{1,6}\s/.test(trimmed)) return line;

    
    if (/^(\d{1,2}\.|-|\*)\s/.test(trimmed)) return line;

    
    const inlineListPattern = /\b(\d{1,2})\.\s+/g;
    const matches = [...line.matchAll(inlineListPattern)];

    if (matches.length < 2) return line;

    const firstMatch = matches[0];
    if (!firstMatch || firstMatch.index === undefined) return line;

    
    const numbers = matches.map((m) => parseInt(m[1]!, 10));
    const isSequential = numbers.every((n, i) => i === 0 || n === numbers[i - 1]! + 1);
    if (!isSequential) return line;

    
    
    const charBeforeFirst = line.slice(0, firstMatch.index).trimEnd();
    if (/#+$/.test(charBeforeFirst)) return line;

    
    const firstIdx = firstMatch.index;
    const prefix = line.slice(0, firstIdx).trimEnd();
    const listPart = line.slice(firstIdx);

    
    const reformatted = listPart.replace(
      /(?<=\S[ \t]+)(\d{1,2})\.\s+/g,
      '\n$1. ',
    );

    return prefix ? `${prefix}\n${reformatted}` : reformatted;
  });

  return processed.join('\n');
}
