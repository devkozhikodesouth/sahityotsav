const mongoose = require("mongoose");

const youtubeSchema = new mongoose.Schema(
  {
    festivalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Festival",
      required: false,
    },
    url: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("YoutubeLink", youtubeSchema);
