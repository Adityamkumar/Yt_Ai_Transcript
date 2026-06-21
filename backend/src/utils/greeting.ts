export const isSimpleGreeting = (text: string): boolean => {
  if (!text) return false;

  // Normalize: remove punctuation, extra spaces, and lowercase
  const normalized = text
    .toLowerCase()
    .replace(/[!?.,\/\\#$%\^&\*;:{}=\-_`~()]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const greetings = [
    "hi",
    "hello",
    "hey",
    "greetings",
    "good morning",
    "good afternoon",
    "good evening",
    "yo",
    "sup",
    "hola",
    "hello there",
    "hi there",
    "hey there",
    "how are you",
    "how are you doing",
    "hows it going",
    "whats up",
    "what up",
    "hi how are you",
    "hello how are you",
    "hey how are you"
  ];

  return greetings.includes(normalized);
};
