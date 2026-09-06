const mongoose = require("mongoose");

const gallerySchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      unique: true,
    },

    photoIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Photo",
      },
    ],

    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    pinHash: {
      type: String,
      required: true,
    },

    isPublished: {
      type: Boolean,
      default: false,
    },

    publishedAt: {
      type: Date,
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Gallery", gallerySchema);