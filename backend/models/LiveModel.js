const mongoose = require("mongoose");

const liveSchema = new mongoose.Schema({
  live1: {
    url: { type: String, required: true }
  },
  live2: {
    url: { type: String, required: true }
  }
});

const LiveLink = mongoose.model("LiveLink", liveSchema);

module.exports = LiveLink;
