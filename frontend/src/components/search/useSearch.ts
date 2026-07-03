import { useCallback, useEffect, useRef, useState } from "react";
import { useDebounce } from "./useDebounce";
import { searchConversations } from "./search.service";
import type { SearchResult } from "./search.types";
import {
  SEARCH_DEBOUNCE_MS,
  SEARCH_DEFAULT_LIMIT,
  SEARCH_MIN_QUERY_LENGTH,
} from "./search.constants";
import { useConversations } from "@/hooks/useConversations";

interface UseSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  results: SearchResult[];
  loading: boolean;
  error: string | null;
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  moveSelection: (direction: "up" | "down") => void;
  selectedResult: SearchResult | undefined;
  reset: () => void;
  hasQuery: boolean;
  hasResults: boolean;
  isRecent: boolean;
}

export function useSearch(): UseSearchReturn {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const abortControllerRef = useRef<AbortController | null>(null);
  const debouncedQuery = useDebounce(query, SEARCH_DEBOUNCE_MS);

  const { conversations } = useConversations();

  const fallbackResults: SearchResult[] = [
    {
      id: "jwt",
      title: "JWT Authentication",
      preview: "Video workspace",
      updatedAt: new Date().toISOString(),
      type: "conversation",
    },
    {
      id: "redis",
      title: "Redis Caching",
      preview: "Video workspace",
      updatedAt: new Date().toISOString(),
      type: "conversation",
    },
    {
      id: "docker",
      title: "Docker Deployment",
      preview: "Video workspace",
      updatedAt: new Date().toISOString(),
      type: "conversation",
    },
    {
      id: "pdf",
      title: "PDF Chat",
      preview: "PDF workspace",
      updatedAt: new Date().toISOString(),
      type: "conversation",
    },
  ];

  const formatConversation = (conv: any): SearchResult => ({
    id: conv._id,
    title: conv.title,
    preview: conv.type === "pdf" ? "PDF workspace" : "Video workspace",
    updatedAt: conv.updatedAt,
    type: "conversation",
  });

  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
  const last7DaysConversations = conversations.filter((conv) => {
    const updatedAtMs = new Date(conv.updatedAt).getTime();
    return Date.now() - updatedAtMs <= SEVEN_DAYS_MS;
  });

  let activeRecentResults: SearchResult[] = [];

  if (last7DaysConversations.length > 0) {
    activeRecentResults = last7DaysConversations.slice(0, 5).map(formatConversation);
  } else if (conversations.length > 0) {
    activeRecentResults = conversations.slice(0, 5).map(formatConversation);
  } else {
    activeRecentResults = fallbackResults;
  }

  const isRecent = query.trim().length === 0;
  const results = isRecent ? activeRecentResults : searchResults;

  useEffect(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    if (debouncedQuery.trim().length < SEARCH_MIN_QUERY_LENGTH) {
      setSearchResults([]);
      setLoading(false);
      setError(null);
      setSelectedIndex(-1);
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);

    searchConversations(debouncedQuery, SEARCH_DEFAULT_LIMIT, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) {
          setSearchResults(data.results);
          setSelectedIndex(-1);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          if (err.name !== "CanceledError" && err.name !== "AbortError") {
            setError(err.message || "Search failed. Please try again.");
          }
          setLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [debouncedQuery]);

  useEffect(() => {
    if (
      query.trim().length >= SEARCH_MIN_QUERY_LENGTH &&
      query !== debouncedQuery
    ) {
      setLoading(true);
    }
  }, [query, debouncedQuery]);

  const moveSelection = useCallback(
    (direction: "up" | "down") => {
      setSelectedIndex((prev) => {
        if (results.length === 0) return -1;

        if (direction === "down") {
          return prev < results.length - 1 ? prev + 1 : 0;
        } else {
          return prev > 0 ? prev - 1 : results.length - 1;
        }
      });
    },
    [results.length],
  );

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setQuery("");
    setSearchResults([]);
    setLoading(false);
    setError(null);
    setSelectedIndex(-1);
  }, []);

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    selectedIndex,
    setSelectedIndex,
    moveSelection,
    selectedResult: selectedIndex >= 0 ? results[selectedIndex] : undefined,
    reset,
    hasQuery: query.trim().length >= SEARCH_MIN_QUERY_LENGTH,
    hasResults: results.length > 0,
    isRecent,
  };
}
