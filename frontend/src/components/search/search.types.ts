export interface SearchResult {
  id: string;
  title: string;
  preview: string;
  updatedAt: string;
  type: string;
}

export interface SearchApiResponse {
  results: SearchResult[];
}

export interface SearchState {
  query: string;
  results: SearchResult[];
  loading: boolean;
  error: string | null;
  selectedIndex: number;
}
