import type { Types } from "mongoose";
import { PdfDocument } from "../../models/pdfDocument.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { Conversation } from "../../models/conversation.model.js";
import { Message } from "../../models/message.model.js";
import { deletePdf } from "../../services/imagekit.service.js";
import logger from "../../lib/logger.js";
import { deletePdfRagArtifacts } from "./pdfRagCleanup.service.js";
import { Bookmark } from "../../models/bookmark.model.js";

export const cleanupPdfDocument = async (
  pdfDocumentId: Types.ObjectId,
  userId: Types.ObjectId,
) => {
  const pdfDoc = await PdfDocument.findById(pdfDocumentId);

  if (!pdfDoc) {
    throw new ApiError(404, "PDF Document not found");
  }

  const conversations = await Conversation.find({
    pdfDocumentId,
    userId,
  }).select("_id");

  const conversationIds = conversations.map((conversation) => conversation._id);

  if (conversationIds.length > 0) {
    await Message.deleteMany({
      conversationId: {
        $in: conversationIds,
      },
    });
  }

  await Conversation.deleteMany({
    _id: {
      $in: conversationIds,
    },
  });

   await cleanupSharedPdfResource(pdfDocumentId)
};


export const cleanupSharedPdfResource = async (
  pdfDocumentId: Types.ObjectId,
) => {
  const remainingConversations = await Conversation.countDocuments({
    pdfDocumentId,
  });

  // Another conversation still references this PDF.
  if (remainingConversations > 0) {
    return;
  }

  const pdfDoc = await PdfDocument.findById(pdfDocumentId);

  if (!pdfDoc) {
    return;
  }

  try {
    await deletePdf(pdfDoc.fileId);
  } catch (err) {
    logger.error(
      { err, pdfDocumentId },
      "[PDF Cleanup] Failed to delete PDF from ImageKit",
    );
  }

  try {
    await deletePdfRagArtifacts(pdfDoc._id);
  } catch (err) {
    logger.error(
      { err, pdfDocumentId },
      "[PDF Cleanup] Failed to delete PDF RAG artifacts",
    );
  }

  await PdfDocument.findByIdAndDelete(pdfDocumentId);
};