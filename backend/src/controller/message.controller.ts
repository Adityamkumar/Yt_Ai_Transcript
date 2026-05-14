import mongoose from "mongoose";
import { Message } from "../models/message.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createMessage = asyncHandler(async (req, res) => {
  const { conversationId, role, content, type = "chat" } = req.body;

  if (!conversationId || !role || !content) {
    throw new ApiError(400, "All fields are required");
  }

  const message = await Message.create({
    conversationId,
    role,
    content,
    type,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, message, "Message created successfully"));
});

export const getMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;

  const messages = await Message.find({
    conversationId: new mongoose.Types.ObjectId(conversationId as string)
  }).sort({
    createdAt: 1
  });

  return res
    .status(200)
    .json(new ApiResponse(200, messages, "Messages fetched successfully"));
});

export const updateMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const { content } = req.body;

  if (!content) {
    throw new ApiError(400, "Content is required");
  }

  const existingMessage = await Message.findById(messageId);

  if (!existingMessage) {
    throw new ApiError(404, "Message not found");
  }

  await Message.deleteMany({
    conversationId: existingMessage.conversationId,
    createdAt: { $gt: existingMessage.createdAt }
  });

  existingMessage.content = content;
  const updatedMessage = await existingMessage.save();

  return res
    .status(200)
    .json(new ApiResponse(200, updatedMessage, "Message updated and subsequent messages removed"));
});

export const deleteConversationMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;

  await Message.deleteMany({
    conversationId: new mongoose.Types.ObjectId(conversationId as string)
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "All messages in conversation deleted"));
});
