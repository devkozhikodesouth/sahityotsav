const mongoose = require("mongoose");

const newsSchema = new mongoose.Schema(
  {
    festivalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Festival",
      required: true,
    },
    image: {
      path: {
        type: String,
        required: true, // Cloudinary secure_url
      },
      publicId: {
        type: String,
        required: true, // Cloudinary public_id for deletion
      },
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

module.exports = mongoose.model("News", newsSchema);
