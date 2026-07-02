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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Ad", adSchema);
