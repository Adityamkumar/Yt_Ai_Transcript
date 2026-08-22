import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { searchQuerySchema } from "./search.validation.js";
import { SearchType, IMPLEMENTED_SEARCH_TYPES } from "./search.types.js";
import type { SearchResponse } from "./search.types.js";
import { searchConversations } from "./search.service.js";

export const search = asyncHandler(async (req: any, res) => {
  if (!req.authUserId) {
    throw new ApiError(401, "Unauthorized — authentication required");
  }

  const parseResult = searchQuerySchema.safeParse(req.query);

  if (!parseResult.success) {
    const messages = parseResult.error.issues
      .map((issue) => issue.message)
      .join(", ");
    throw new ApiError(400, messages);
  }

  const { q, type, limit } = parseResult.data;

  if (!IMPLEMENTED_SEARCH_TYPES.includes(type as SearchType)) {
    throw new ApiError(
      400,
      `Search type '${type}' is not yet supported. Available: ${IMPLEMENTED_SEARCH_TYPES.join(", ")}`,
    );
  }

  let results: SearchResponse["results"] = [];

  switch (type) {
    case SearchType.CONVERSATION:
      results = await searchConversations(req.authUserId, q, limit);
      break;

    default:
      throw new ApiError(400, `Unsupported search type: ${type}`);
  }

  const response: SearchResponse = { results };

  return res
    .status(200)
    .json(new ApiResponse(200, response, "Search completed"));
});
