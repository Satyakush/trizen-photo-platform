const mongoose = require("mongoose");

const photoSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    filename: {
      type: String,
      required: true,
      trim: true,
    },

    storageUrl: {
      type: String,
      required: true,
    },

    storagePublicId: {
      type: String,
      required: true,
    },

    fileSize: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

photoSchema.index({ eventId: 1 });
photoSchema.index({ uploadedBy: 1 });
photoSchema.index({ eventId: 1, uploadedBy: 1 });

module.exports = mongoose.model("Photo", photoSchema);