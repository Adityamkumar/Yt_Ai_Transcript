import type { PipelineStage } from "mongoose";
import { RAG_CONFIG } from "../rag/RagConfig/rag.config.js";
import type {
  VectorSearchAggregateSource,
  VectorSearchPipelineOptions,
} from "./vectorSearch.types.js";

const getNumCandidates = (limit: number, numCandidates?: number) => {
  return (
    numCandidates ??
    Math.max(limit, limit * RAG_CONFIG.retrieval.numCandidatesMultiplier)
  );
};

export const buildVectorSearchPipeline = ({
  index,
  queryVector,
  path = RAG_CONFIG.retrieval.vectorPath,
  limit = RAG_CONFIG.retrieval.topK,
  numCandidates,
  filter,
  scoreField = RAG_CONFIG.retrieval.scoreField,
  project,
}: VectorSearchPipelineOptions): PipelineStage[] => {
  if (queryVector.length !== RAG_CONFIG.embeddings.dimensions) {
    throw new Error(
      `Query vector dimension mismatch. Expected ${RAG_CONFIG.embeddings.dimensions}, received ${queryVector.length}.`,
    );
  }

  const vectorSearchStage: Record<string, unknown> = {
    index,
    path,
    queryVector,
    numCandidates: getNumCandidates(limit, numCandidates),
    limit,
  };

  if (filter) {
    vectorSearchStage.filter = filter;
  }

  const pipeline: PipelineStage[] = [
    { $vectorSearch: vectorSearchStage } as unknown as PipelineStage,
    {
      $addFields: {
        [scoreField]: { $meta: "vectorSearchScore" },
      },
    } as PipelineStage,
  ];

  if (project) {
    pipeline.push({ $project: project } as PipelineStage);
  }

  return pipeline;
};

export const executeVectorSearch = async <TResult>(
  source: VectorSearchAggregateSource,
  options: VectorSearchPipelineOptions,
) => {
  const pipeline = buildVectorSearchPipeline(options);

  return source.aggregate<TResult>(pipeline).exec();
};

export const filterBySimilarityThreshold = <
  TResult extends { score: number }
>(
  results: TResult[],
  minSimilarityScore = RAG_CONFIG.retrieval.minSimilarityScore,
) => {
  return results.filter(
    (result) => result.score >= minSimilarityScore
  );
};
