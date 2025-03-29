const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sharedWith: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        permission: {
          type: String,
          enum: ["view", "edit"],
          default: "view",
        },
      },
    ],
    color: {
      type: String,
      default: "ffffff", // Default white color without #
      validate: {
        validator: function (v) {
          return /^([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
        },
        message: "Color must be a valid hex color code without #",
      },
    },
    attachments: [
      {
        filename: {
          type: String,
          required: true,
        },
        originalname: {
          type: String,
          required: true,
        },
        mimetype: {
          type: String,
          required: true,
        },
        size: {
          type: Number,
          required: true,
          max: 1024 * 1024, // 1MB
        },
        path: {
          type: String,
          required: true,
        },
      },
    ],
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
  },
  {
    timestamps: true, // This will add createdAt and updatedAt fields automatically
  }
);

// Add index for better query performance
noteSchema.index({ user_id: 1, title: 1 });
noteSchema.index({ sharedWith: 1 });

module.exports = mongoose.model("Note", noteSchema);
