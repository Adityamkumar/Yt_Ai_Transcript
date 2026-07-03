export const SearchType = {
  CONVERSATION: "conversation",
  PDF: "pdf",
  NOTES: "notes",
  YOUTUBE: "youtube",
  ALL: "all",
} as const;

export type SearchType = (typeof SearchType)[keyof typeof SearchType];

export const IMPLEMENTED_SEARCH_TYPES: readonly SearchType[] = [
  SearchType.CONVERSATION,
] as const;

export interface SearchQuery {
  q: string;
  type: SearchType;
  limit: number;
}

export interface SearchResult {
  id: string;
  title: string;
  preview: string;
  updatedAt: string;
  type: SearchType;
}

export interface SearchResponse {
  results: SearchResult[];
}
