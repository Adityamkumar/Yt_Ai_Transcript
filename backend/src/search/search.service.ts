import type { Types } from "mongoose";
import { Conversation } from "../models/conversation.model.js";
import type { SearchResult } from "./search.types.js";
import { SearchType } from "./search.types.js";
import { SEARCH_RANK_WEIGHTS } from "./search.constants.js";
import { escapeRegex } from "./search.utils.js";

function computeTitleRelevance(title: string, query: string): number {
  const normalizedTitle = title.replace(/\*\*/g, "").toLowerCase();
  const normalizedQuery = query.toLowerCase();

  if (normalizedTitle === normalizedQuery) {
    return SEARCH_RANK_WEIGHTS.EXACT_MATCH;
  }
  if (normalizedTitle.startsWith(normalizedQuery)) {
    return SEARCH_RANK_WEIGHTS.STARTS_WITH;
  }
  if (normalizedTitle.includes(normalizedQuery)) {
    return SEARCH_RANK_WEIGHTS.CONTAINS;
  }
  return 0;
}

function buildPreview(type: string): string {
  switch (type) {
    case "pdf":
      return "PDF workspace";
    case "video":
      return "Video workspace";
    default:
      return "Conversation";
  }
}

export async function searchConversations(
  userId: Types.ObjectId,
  query: string,
  limit: number,
): Promise<SearchResult[]> {
  const escapedQuery = escapeRegex(query);
  const regexPattern = new RegExp("^" + escapedQuery, "i");

  const [textResults, regexResults] = await Promise.all([
    Conversation.find(
      {
        userId,
        $text: { $search: query },
      },
      {
        score: { $meta: "textScore" },
      }
    )
      .select("_id title type updatedAt")
      .lean(),

    Conversation.find({
      userId,
      title: { $regex: regexPattern },
    })
      .select("_id title type updatedAt")
      .limit(limit * 2)
      .lean(),
  ]);

  const mergedMap = new Map<string, { doc: any; textScore: number }>();

  for (const doc of textResults) {
    mergedMap.set(String(doc._id), {
      doc,
      textScore: (doc as any).score || 0,
    });
  }

  for (const doc of regexResults) {
    const key = String(doc._id);
    if (!mergedMap.has(key)) {
      mergedMap.set(key, {
        doc,
        textScore: 0,
      });
    }
  }

  const ranked = Array.from(mergedMap.values())
    .map(({ doc, textScore }) => {
      const titleBoost = computeTitleRelevance(doc.title, query);
      const recencyBonus =
        new Date(doc.updatedAt).getTime() / (Date.now() || 1);

      return {
        doc,
        combinedScore: titleBoost + textScore * 10 + recencyBonus,
      };
    })
    .sort((a, b) => b.combinedScore - a.combinedScore)
    .slice(0, limit);

  return ranked.map(({ doc }) => ({
    id: String(doc._id),
    title: doc.title,
    preview: buildPreview(doc.type),
    updatedAt: new Date(doc.updatedAt).toISOString(),
    type: SearchType.CONVERSATION,
  }));
}
