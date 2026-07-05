const mongoose = require("mongoose");

const youtubeSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("YoutubeLink", youtubeSchema);
