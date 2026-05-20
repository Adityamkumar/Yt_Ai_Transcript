import { PdfDocument } from "../models/pdfDocument.model.js";
import type { IPdfChunk } from "../models/pdfDocument.model.js";
import { Types } from "mongoose";

const STOPWORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and",
  "any", "are", "arent", "as", "at", "be", "because", "been", "before", "being",
  "below", "between", "both", "but", "by", "cant", "cannot", "could", "couldnt",
  "did", "didnt", "do", "does", "doesnt", "doing", "dont", "down", "during",
  "each", "few", "for", "from", "further", "had", "hadnt", "has", "hasnt", "have",
  "havent", "having", "he", "hed", "hell", "hes", "her", "here", "heres", "hers",
  "herself", "him", "himself", "his", "how", "hows", "i", "id", "ill", "im",
  "ive", "if", "in", "into", "is", "isnt", "it", "its", "itself", "lets", "me",
  "more", "most", "mustnt", "my", "myself", "no", "nor", "not", "of", "off",
  "on", "once", "only", "or", "other", "ought", "our", "ours", "ourselves",
  "out", "over", "own", "same", "shant", "she", "shed", "shell", "shes", "should",
  "shouldnt", "so", "some", "such", "than", "that", "thats", "the", "their",
  "theirs", "them", "themselves", "then", "there", "theres", "these", "they",
  "theyd", "theyll", "theyre", "theyve", "this", "those", "through", "to", "too",
  "under", "until", "up", "very", "was", "wasnt", "we", "wed", "well", "were",
  "weve", "werent", "what", "whats", "when", "whens", "where", "wheres", "which",
  "while", "who", "whos", "whom", "why", "whys", "with", "wont", "would",
  "wouldnt", "you", "youd", "youll", "youre", "youve", "your", "yours", "yourself",
  "yourselves"
]);

export const retrieveRelevantChunks = async (
  documentId: string | Types.ObjectId,
  question: string,
  limit = 8
): Promise<IPdfChunk[]> => {
  const docId = typeof documentId === "string" ? new Types.ObjectId(documentId) : documentId;

  const pdfDoc = await PdfDocument.findById(docId);
  if (!pdfDoc || !pdfDoc.chunks || pdfDoc.chunks.length === 0) {
    return [];
  }

  // 1. Preprocess query: tokenize, lowercase, clean non-word, filter stopwords
  const words = question
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 1 && !STOPWORDS.has(w));

  // If no searchable terms left, fallback to first chunks of document
  if (words.length === 0) {
    const sorted = [...pdfDoc.chunks].sort((a, b) => a.chunkIndex - b.chunkIndex);
    return sorted.slice(0, limit);
  }

  // 2. Filter candidate chunks in-memory using keywords
  const candidateChunks = pdfDoc.chunks.filter(chunk => {
    const lowerText = chunk.text.toLowerCase();
    return words.some(word => lowerText.includes(word));
  });

  // If no matches, fallback to first chunks
  if (candidateChunks.length === 0) {
    const sorted = [...pdfDoc.chunks].sort((a, b) => a.chunkIndex - b.chunkIndex);
    return sorted.slice(0, limit);
  }

  // 3. TF-lite scoring based on keyword frequency
  const scoredChunks = candidateChunks.map(chunk => {
    let score = 0;
    const lowerText = chunk.text.toLowerCase();
    
    for (const word of words) {
      const matches = lowerText.split(word).length - 1;
      score += matches;
    }
    
    return { chunk, score };
  });

  // Sort by score descending and take the top ones
  scoredChunks.sort((a, b) => b.score - a.score);

  const topChunks = scoredChunks.slice(0, limit).map(item => item.chunk);
  
  // Sort by chunkIndex to maintain context flow
  topChunks.sort((a, b) => a.chunkIndex - b.chunkIndex);

  return topChunks;
};
