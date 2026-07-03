export const SEARCH_DEFAULT_LIMIT = 8;
export const SEARCH_MAX_LIMIT = 20;
export const SEARCH_MIN_QUERY_LENGTH = 3;

export const SEARCH_RANK_WEIGHTS = {
  EXACT_MATCH: 100,
  STARTS_WITH: 50,
  CONTAINS: 20,
} as const;
