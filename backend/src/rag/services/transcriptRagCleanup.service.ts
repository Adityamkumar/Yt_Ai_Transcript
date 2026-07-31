import { Types } from "mongoose";
import { TranscriptChunk } from "../../models/transcriptChunk.model.js";
import logger from "../../lib/logger.js";

export type DeleteVideoRagArtifactsResult = {
  deletedChunkCount: number;
};

const toObjectId = (value: string | Types.ObjectId): Types.ObjectId =>
  typeof value === "string" ? new Types.ObjectId(value) : value;


export const deleteVideoRagArtifacts = async (
  videoDocumentId: string | Types.ObjectId,
): Promise<DeleteVideoRagArtifactsResult> => {
  const videoObjectId = toObjectId(videoDocumentId);

  const result = await TranscriptChunk.deleteMany({ videoDocumentId: videoObjectId });

  const deletedChunkCount = result.deletedCount ?? 0;

  logger.info(
    { deletedChunkCount, videoDocumentId: videoObjectId },
    "[RAG Cleanup] Deleted chunk(s)"
  );

  return { deletedChunkCount };
};
