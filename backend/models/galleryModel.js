const mongoose = require("mongoose");

const gallerySchema = new mongoose.Schema(
  {
    festivalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Festival",
      required: false,
    },
    path: {
      type: String,
      required: true, // Cloudinary secure_url
    },
    publicId: {
      type: String,
      required: true, // Cloudinary public_id for deletion
    },
   
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

module.exports = mongoose.model("Gallery", gallerySchema);
