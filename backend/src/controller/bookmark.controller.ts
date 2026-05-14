import { Bookmark } from "../models/bookmark.model.js";
import { Conversation } from "../models/conversation.model.js";
import { Message } from "../models/message.model.js";
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const bookMark = asyncHandler(async (req, res) => {
  const { conversationId, messageId, type, title, content } = req.body;

  if (!conversationId || !messageId || !type || !title || !content) {
    throw new ApiError(400, "All fields are required");
  }

  const conversation = await Conversation.findOne({
    _id: conversationId,
    userId: req.user?._id!,
  });

  if (!conversation) {
    throw new ApiError(404, "conversation not found!");
  }

  const message = await Message.findOne({
    _id: messageId,
    conversationId,
  });

  if (!message) {
    throw new ApiError(404, "message not found!");
  }

  const bookmark = await Bookmark.create({
    userId: req.user?._id!,
    conversationId: conversationId,
    messageId: messageId,
    type: type,
    title: title,
    content: content,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, bookmark, "Bookmark created successfully"));
});

export const getBookmarks = asyncHandler(async (req, res) => {
  if (!req.user?._id) {
    throw new ApiError(401, "Unauthorized request");
  }

  const bookmarks = await Bookmark.find({
    userId: req.user._id,
  })
    .sort({
      createdAt: -1,
    })
    .populate("conversationId", "title");

  return res
    .status(200)
    .json(new ApiResponse(200, bookmarks, "Bookmarks fetched successfully"));
});

export const deleteBookmark = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "Bookmark ID is required");
  }

  const bookmark = await Bookmark.findOneAndDelete({
    _id: id,
    userId: req.user?._id!,
  });

  if (!bookmark) {
    throw new ApiError(404, "Bookmark not found or unauthorized");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Bookmark deleted successfully"));
});
