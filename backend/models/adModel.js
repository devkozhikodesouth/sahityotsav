const mongoose = require("mongoose");

const adSchema = new mongoose.Schema(
  {
    festivalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Festival",
      required: true,
    },
    path: {
      type: String,
      required: true, // Cloudinary URL
    },
    publicId: {
      type: String,
      required: true, // Cloudinary public_id for deletion
    },
    link: {
      type: String,
      default: "", // Click-through URL
    },
    title: {
      type: String,
      default: "", // Alt text / Name of ad
    },
    minRank: {
      type: Number,
      default: null, // Minimum result position/rank
    },
    maxRank: {
      type: Number,
      default: null, // Maximum result position/rank
    },
    startRange: {
      type: Number,
      default: null, // Start range (min rank)
    },
    endRange: {
      type: Number,
      default: null, // End range (max rank)
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Ad", adSchema);
