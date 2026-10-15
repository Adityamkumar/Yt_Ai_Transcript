import { Conversation } from "../models/conversation.model.js";
import { Message } from "../models/message.model.js";
import { Video } from "../models/VideoUrl.model.js";
import { PdfDocument } from "../models/pdfDocument.model.js";
import { SourceAccess } from "../models/sourceAccess.model.js";
import { deleteVideoRagArtifacts } from "../rag/services/transcriptRagCleanup.service.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import logger from "../lib/logger.js";
import { cleanupSharedPdfResource } from "../rag/services/PdfCleanup.service.js";

export const conversation = asyncHandler(async (req: any, res) => {
  const { videoId, pdfDocumentId, type = "video", title } = req.body;

  if (!title) {
    throw new ApiError(400, "Title is required");
  }

  if (!req.authUserId) {
    throw new ApiError(401, "Unauthorized request");
  }

  if (type !== "video" && type !== "pdf") {
    throw new ApiError(400, "Conversation type must be video or pdf");
  }

  if (
    (type === "video" && (!videoId || pdfDocumentId)) ||
    (type === "pdf" && (!pdfDocumentId || videoId))
  ) {
    throw new ApiError(400, "Source reference does not match conversation type");
  }

  const sourceId = type === "video" ? videoId : pdfDocumentId;
  if (!mongoose.isValidObjectId(sourceId)) {
    throw new ApiError(400, "Invalid source ID");
  }

  const sourceExists = type === "video"
    ? await Video.exists({ _id: sourceId })
    : await PdfDocument.exists({ _id: sourceId });
  if (!sourceExists) {
    throw new ApiError(404, "Source not found or unavailable");
  }

  const sourceAccess = await SourceAccess.exists({
    userId: req.authUserId,
    sourceType: type,
    sourceId,
  });
  if (!sourceAccess) {
    throw new ApiError(404, "Source not found or unavailable");
  }

  const conversation = await Conversation.create({
    userId: req.authUserId,
    videoId: type === "video" ? sourceId : undefined,
    pdfDocumentId: type === "pdf" ? sourceId : undefined,
    type,
    title,
  });

  const populatedConversation = await Conversation.findById(conversation._id)
    .populate("videoId")
    .populate("pdfDocumentId");

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        populatedConversation,
        "Conversation created successfully",
      ),
    );
});

export const getConversations = asyncHandler(async (req: any, res) => {
  if (!req.authUserId) {
    throw new ApiError(401, "Unauthorized request");
  }

  const conversations = await Conversation.find({
    userId: req.authUserId,
  })
    .populate("videoId")
    .populate("pdfDocumentId")
    .sort({
      createdAt: -1,
    });

  return res
    .status(200)
    .json(
      new ApiResponse(200, conversations, "Conversations fetched successfully"),
    );
});

export const updateConversationPin = asyncHandler(async (req: any, res) => {
  const { conversationId } = req.params;
  const { isPinned } = req.body;

  if (!conversationId) {
    throw new ApiError(400, "ConversationId is required");
  }

  if (typeof isPinned !== "boolean") {
    throw new ApiError(400, "isPinned must be a boolean");
  }

  if (!req.authUserId) {
    throw new ApiError(401, "Unauthorized request");
  }

  const updatedConversation = await Conversation.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(conversationId as string),
      userId: req.authUserId,
    },
    { isPinned },
    { new: true, timestamps: false },
  );

  if (!updatedConversation) {
    throw new ApiError(404, "Conversation not found or unauthorized");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedConversation, "Conversation pin updated successfully"));
});

export const deleteConversation = asyncHandler(async (req: any, res) => {
  const { conversationId } = req.params;

  if (!conversationId) {
    throw new ApiError(400, "ConversationId is required");
  }

  if (!req.authUserId) {
    throw new ApiError(401, "Unauthorized request");
  }

  const conversation = await Conversation.findOne({
    _id: new mongoose.Types.ObjectId(conversationId as string),
    userId: req.authUserId,
  });

  if (!conversation) {
    throw new ApiError(404, "Conversation not found or unauthorized");
  }

  const videoId = conversation.videoId;
  const pdfDocumentId = conversation.pdfDocumentId;

  await Message.deleteMany({ conversationId });
  await Conversation.findByIdAndDelete(conversationId);

  if (conversation.type === "pdf" && pdfDocumentId) {
     await cleanupSharedPdfResource(pdfDocumentId);
  } else if (videoId) {
    const remainingConversations = await Conversation.countDocuments({
      videoId,
    });
    if (remainingConversations === 0) {
      try {
        await deleteVideoRagArtifacts(videoId);
      } catch (err: any) {
        logger.error(
          { err, videoId },
          "[RAG Cleanup] Failed to delete RAG chunks",
        );
      }
      await Video.findByIdAndDelete(videoId);
    }
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Conversation deleted successfully"));
});
