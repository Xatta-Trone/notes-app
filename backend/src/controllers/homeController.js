const Note = require("../models/Note");
const User = require("../models/User");
const { baseUrl, uploadsPath } = require("../config/config");
const path = require("path");

exports.getHomeData = async (req, res) => {
  try {
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Build search query
    let searchQuery = {
      $or: [{ user_id: userId }, { "sharedWith.user": userId }],
    };

    // Add text search for title and body
    if (req.query.query) {
      searchQuery.$and = [
        {
          $or: [
            { title: { $regex: req.query.query, $options: "i" } },
            { body: { $regex: req.query.query, $options: "i" } },
          ],
        },
      ];
    }

    // Add color search
    if (req.query.color) {
      if (!searchQuery.$and) searchQuery.$and = [];
      searchQuery.$and.push({
        color: req.query.color.replace("#", ""),
      });
    }

    // Add categories search
    if (req.query.categories) {
      if (!searchQuery.$and) searchQuery.$and = [];
      searchQuery.$and.push({
        categories: {
          $all: Array.isArray(req.query.categories)
            ? req.query.categories
            : [req.query.categories],
        },
      });
    }

    const notes = await Note.find(searchQuery)
      .populate("user_id", "username email")
      .populate("sharedWith.user", "username email")
      .populate("categories", "name color")
      .select(
        "title body color createdAt updatedAt user_id sharedWith categories"
      )
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalNotes = await Note.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalNotes / limit);

    // Format notes for response
    const formattedNotes = notes.map((note) => ({
      id: note._id,
      title: note.title,
      body: note.body,
      color: `#${note.color || "ffffff"}`,
      categories: note.categories.map((category) => ({
        id: category._id,
        name: category.name,
        color: `#${category.color || "ffffff"}`,
      })),
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
      author: {
        id: note.user_id._id,
        username: note.user_id.username,
        email: note.user_id.email,
      },
      sharedWith: note.sharedWith.map((share) => ({
        user: {
          id: share.user._id,
          username: share.user.username,
          email: share.user.email,
        },
        permission: share.permission,
      })),
      isOwner: note.user_id._id.toString() === userId,
      userPermission:
        note.user_id._id.toString() === userId
          ? "owner"
          : note.sharedWith.find(
              (share) => share.user._id.toString() === userId
            )?.permission || "none",
    }));

    res.json({
      success: true,
      message: "Notes retrieved successfully",
      pagination: {
        currentPage: page,
        totalPages,
        totalNotes,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      notes: formattedNotes,
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({
      success: false,
      errors: {
        server: "Error searching notes",
      },
    });
  }
};
