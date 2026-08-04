export type SummaryLanguage =
  | "english"
  | "hindi"
  | "hinglish";

export const buildLanguageInstruction = (
  language: SummaryLanguage,
): string => {
  switch (language) {
    case "hindi":
      return `
Language Instruction:
- Respond ONLY in Hindi.
- Keep technical terms like LLM, RAG, Vector Database, Embedding, MongoDB, Node.js in English unless a widely accepted Hindi equivalent exists.
`;

    case "hinglish":
      return `
Language Instruction:
- Respond ONLY in Hinglish.
- Write Hindi using English letters.
- Keep all technical terms in English.
`;

    default:
      return `
Language Instruction:
- Respond ONLY in English.
`;
  }
};



export const detectSummaryLanguage = (
  question: string,
): SummaryLanguage => {
  const q = question.toLowerCase();

  if (q.includes("hinglish")) {
    return "hinglish";
  }

  if (
    q.includes("hindi") ||
    q.includes("हिंदी") ||
    q.includes("हिन्दी")
  ) {
    return "hindi";
  }

  return "english";
};