import { z } from "zod/v4";
import { SearchType } from "./search.types.js";
import {
  SEARCH_DEFAULT_LIMIT,
  SEARCH_MAX_LIMIT,
  SEARCH_MIN_QUERY_LENGTH,
} from "./search.constants.js";

export const searchQuerySchema = z.object({
  q: z
    .string()
    .transform((v) => v.trim())
    .pipe(
      z.string().min(SEARCH_MIN_QUERY_LENGTH, {
        message: `Search query must be at least ${SEARCH_MIN_QUERY_LENGTH} characters`,
      })
    ),

  type: z
    .enum([
      SearchType.CONVERSATION,
      SearchType.PDF,
      SearchType.NOTES,
      SearchType.YOUTUBE,
      SearchType.ALL,
    ])
    .default(SearchType.CONVERSATION),

  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(SEARCH_MAX_LIMIT)
    .default(SEARCH_DEFAULT_LIMIT),
});

export type ValidatedSearchQuery = z.infer<typeof searchQuerySchema>;
