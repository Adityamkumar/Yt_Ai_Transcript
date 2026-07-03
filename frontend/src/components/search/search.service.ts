import axiosInstance from "@/lib/axios";
import type { ApiResponse } from "@/types";
import type { SearchApiResponse } from "./search.types";
import { SEARCH_DEFAULT_LIMIT } from "./search.constants";

export async function searchConversations(
  query: string,
  limit: number = SEARCH_DEFAULT_LIMIT,
  signal?: AbortSignal,
): Promise<SearchApiResponse> {
  const response = await axiosInstance.get<ApiResponse<SearchApiResponse>>(
    "/api/v1/search",
    {
      params: {
        q: query,
        type: "conversation",
        limit,
      },
      signal,
    },
  );

  return response.data.data;
}
