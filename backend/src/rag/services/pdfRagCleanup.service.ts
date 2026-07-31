import { Types } from "mongoose";
import { PdfChunk } from "../../models/pdfChunk.model.js";
import logger from "../../lib/logger.js";

export type DeletePdfRagArtifactsResult = {
  deletedChunkCount: number;
};

const toObjectId = (value: string | Types.ObjectId): Types.ObjectId =>
  typeof value === "string" ? new Types.ObjectId(value) : value;

export const deletePdfRagArtifacts = async (
  documentId: string | Types.ObjectId,
): Promise<DeletePdfRagArtifactsResult> => {
  const documentObjectId = toObjectId(documentId);

  const result = await PdfChunk.deleteMany({ documentId: documentObjectId });

  const deletedChunkCount = result.deletedCount ?? 0;

  logger.info(
    { deletedChunkCount, documentId: documentObjectId },
    "[RAG Cleanup] Deleted chunk(s)"
  );

  return { deletedChunkCount };
};
