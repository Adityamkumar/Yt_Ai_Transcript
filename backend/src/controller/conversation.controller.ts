import { Conversation } from "../models/conversation.model.js";
import { Message } from "../models/message.model.js";
import { Video } from "../models/VideoUrl.model.js";
import { PdfDocument } from "../models/pdfDocument.model.js";
import { deletePdf } from "../services/imagekit.service.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

export const conversation = asyncHandler(async (req: any, res) => {
  const { videoId, pdfDocumentId, type = "video", title } = req.body;

  if (!title) {
    throw new ApiError(400, "Title is required");
  }

  if (type === "video" && !videoId) {
    throw new ApiError(400, "VideoId is required for video conversations");
  }

  if (type === "pdf" && !pdfDocumentId) {
    throw new ApiError(400, "PdfDocumentId is required for pdf conversations");
  }

  if (!req.user?._id) {
    throw new ApiError(401, "Unauthorized request");
  }

  const conversation = await Conversation.create({
    userId: req.user._id,
    videoId: type === "video" ? videoId : undefined,
    pdfDocumentId: type === "pdf" ? pdfDocumentId : undefined,
    type,
    title,
  });

  const populatedConversation = await Conversation.findById(conversation._id)
    .populate("videoId")
    .populate("pdfDocumentId");

  res
    .status(200)
    .json(
      new ApiResponse(200, populatedConversation, "Conversation created successfully"),
    );
});

export const getConversations = asyncHandler(async (req: any, res) => {
  if (!req.user?._id) {
    throw new ApiError(401, "Unauthorized request");
  }

  const conversations = await Conversation.find({
    userId: req.user._id,
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

export const deleteConversation = asyncHandler(async (req: any, res) => {
  const { conversationId } = req.params;

  if (!conversationId) {
    throw new ApiError(400, "ConversationId is required");
  }

  if (!req.user?._id) {
    throw new ApiError(401, "Unauthorized request");
  }

  const conversation = await Conversation.findOne({
    _id: new mongoose.Types.ObjectId(conversationId as string),
    userId: req.user._id,
  });

  if (!conversation) {
    throw new ApiError(404, "Conversation not found or unauthorized");
  }

  const videoId = conversation.videoId;
  const pdfDocumentId = conversation.pdfDocumentId;

  await Message.deleteMany({ conversationId });
  await Conversation.findByIdAndDelete(conversationId);

  if (conversation.type === "pdf" && pdfDocumentId) {
    const pdfDoc = await PdfDocument.findById(pdfDocumentId);
    if (pdfDoc) {
      try {
        await deletePdf(pdfDoc.fileId);
      } catch (err) {
        console.error("Failed to delete PDF from ImageKit storage during conversation deletion:", err);
      }
      await PdfDocument.findByIdAndDelete(pdfDocumentId);
    }
  } else if (videoId) {
    const remainingConversations = await Conversation.countDocuments({ videoId });
    if (remainingConversations === 0) {
      await Video.findByIdAndDelete(videoId);
    }
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Conversation deleted successfully"));
});
