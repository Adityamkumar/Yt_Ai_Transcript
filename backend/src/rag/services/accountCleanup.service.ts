import { Types } from "mongoose";
import { Conversation } from "../../models/conversation.model.js";
import { Message } from "../../models/message.model.js";
import { deleteVideoRagArtifacts } from "./transcriptRagCleanup.service.js";
import logger from "../../lib/logger.js";
import { Video } from "../../models/VideoUrl.model.js";
import { Bookmark } from "../../models/bookmark.model.js";
import { cleanupSharedPdfResource } from "./PdfCleanup.service.js";

export const cleanupUserData = async (userId: Types.ObjectId) => {
  const conversations = await Conversation.find({ userId }).select(
    "_id videoId pdfDocumentId type",
  );

  const conversationIds = conversations.map((conversation) => conversation._id);

  const videoIds = [
    ...new Set(
      conversations
        .filter(
          (conversation) =>
            conversation.type === "video" && conversation.videoId,
        )
        .map((conversation) => conversation.videoId!.toString()),
    ),
  ].map((id) => new Types.ObjectId(id));


  const pdfDocumentIds = [
  ...new Set(
    conversations
      .filter(
        (conversation) =>
          conversation.type === "pdf" &&
          conversation.pdfDocumentId,
      )
      .map((conversation) => conversation.pdfDocumentId!.toString()),
  ),
].map((id) => new Types.ObjectId(id));


  await Message.deleteMany({
    conversationId: { $in: conversationIds },
  });

  await Conversation.deleteMany({ userId });

  for (const videoId of videoIds) {
    const remainingConversations = await Conversation.countDocuments({
      videoId,
    });

    if (remainingConversations > 0) {
      continue;
    }

    try {
      await deleteVideoRagArtifacts(videoId);
    } catch (err) {
      logger.error(
        { err, videoId },
        "[RAG Cleanup] Failed to delete video RAG artifacts",
      );
    }

    await Video.findByIdAndDelete(videoId);
  }

  for (const pdfDocumentId of pdfDocumentIds) {
  await cleanupSharedPdfResource(pdfDocumentId);
}

  // 6. Delete user's bookmarks
  await Bookmark.deleteMany({ userId });
};
