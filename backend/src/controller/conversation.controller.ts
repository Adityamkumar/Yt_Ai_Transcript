import { Conversation } from "../models/conversation.model.js";
import { Message } from "../models/message.model.js";
import { Video } from "../models/VideoUrl.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

export const conversation = asyncHandler(async (req, res) => {
  const { videoId, title } = req.body;

  if (!videoId || !title) {
    throw new ApiError(400, "VideoId and Title are required");
  }

  if (!req.user?._id) {
    throw new ApiError(401, "Unauthorized request");
  }

  const conversation = await Conversation.create({
    userId: req.user._id,
    videoId,
    title,
  });

  const populatedConversation = await Conversation.findById(conversation._id).populate("videoId");

  res
    .status(200)
    .json(
      new ApiResponse(200, populatedConversation, "Conversation created successfully"),
    );
});

export const getConversations = asyncHandler(async (req, res) => {
  if (!req.user?._id) {
    throw new ApiError(401, "Unauthorized request");
  }

  const conversations = await Conversation.find({
    userId: req.user._id,
  })
    .populate("videoId")
    .sort({
      createdAt: -1,
    });

  return res
    .status(200)
    .json(
      new ApiResponse(200, conversations, "Conversations fetched successfully"),
    );
});

export const deleteConversation = asyncHandler(async (req, res) => {
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

  await Message.deleteMany({ conversationId });
  await Conversation.findByIdAndDelete(conversationId);

  const remainingConversations = await Conversation.countDocuments({ videoId });
  if (remainingConversations === 0) {
    await Video.findByIdAndDelete(videoId);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Conversation deleted successfully"));
});
