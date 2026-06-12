import { Types } from "mongoose";
import { TranscriptChunk } from "../../models/transcriptChunk.model.js";

export type DeleteVideoRagArtifactsResult = {
  deletedChunkCount: number;
};

const toObjectId = (value: string | Types.ObjectId): Types.ObjectId =>
  typeof value === "string" ? new Types.ObjectId(value) : value;

/**
 * Service to clean up stored RAG chunks associated with a video.
 */
export const deleteVideoRagArtifacts = async (
  videoDocumentId: string | Types.ObjectId,
): Promise<DeleteVideoRagArtifactsResult> => {
  const videoObjectId = toObjectId(videoDocumentId);

  const result = await TranscriptChunk.deleteMany({ videoDocumentId: videoObjectId });

  const deletedChunkCount = result.deletedCount ?? 0;

  console.info(
    `[RAG Cleanup] Deleted ${deletedChunkCount} chunk(s) for videoDocumentId=${videoObjectId}`,
  );

  return { deletedChunkCount };
};
