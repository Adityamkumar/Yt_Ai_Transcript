import type { PipelineStage } from "mongoose";

export type VectorSearchFilter = Record<string, unknown>;

export type VectorSearchPipelineOptions = {
  index: string;
  queryVector: number[];
  path?: string;
  limit?: number;
  numCandidates?: number;
  filter?: VectorSearchFilter;
  scoreField?: string;
  project?: Record<string, unknown>;
};

export type VectorSearchResult<TMetadata extends Record<string, unknown> = Record<string, unknown>> = {
  id: string;
  text: string;
  score: number;
  metadata: TMetadata;
};

export type VectorSearchAggregateSource = {
  aggregate<TResult = unknown>(
    pipeline: PipelineStage[],
  ): {
    exec(): Promise<TResult[]>;
  };
};
