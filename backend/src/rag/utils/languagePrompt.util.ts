export type SummaryLanguage =
  | "english"
  | "hindi"
  | "hinglish";

export type ResponseLanguage =
  | "en"
  | "hi"
  | "ta"
  | "te"
  | "kn"
  | "ml"
  | "bn"
  | "mr";



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




export const buildResponseLanguageInstruction = (
  language: ResponseLanguage,
): string => {
  switch (language) {
    case "hi":
      return `
Language Instruction:
- Respond ONLY in Hindi.
- Keep technical terms like LLM, RAG, Vector Database, Embedding, MongoDB, Node.js in English unless a widely accepted Hindi equivalent exists.
`;

    case "ta":
      return `
Language Instruction:
- Respond ONLY in Tamil.
- Keep technical terms like LLM, RAG, Vector Database, Embedding, MongoDB, Node.js in English.
`;

    case "te":
      return `
Language Instruction:
- Respond ONLY in Telugu.
- Keep technical terms like LLM, RAG, Vector Database, Embedding, MongoDB, Node.js in English.
`;

    case "kn":
      return `
Language Instruction:
- Respond ONLY in Kannada.
- Keep technical terms like LLM, RAG, Vector Database, Embedding, MongoDB, Node.js in English.
`;

    case "ml":
      return `
Language Instruction:
- Respond ONLY in Malayalam.
- Keep technical terms like LLM, RAG, Vector Database, Embedding, MongoDB, Node.js in English.
`;

    case "bn":
      return `
Language Instruction:
- Respond ONLY in Bengali.
- Keep technical terms like LLM, RAG, Vector Database, Embedding, MongoDB, Node.js in English.
`;

    case "mr":
      return `
Language Instruction:
- Respond ONLY in Marathi.
- Keep technical terms like LLM, RAG, Vector Database, Embedding, MongoDB, Node.js in English.
`;

    default:
      return `
Language Instruction:
- Respond ONLY in English.
`;
  }
};
