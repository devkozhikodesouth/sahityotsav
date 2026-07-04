const mongoose = require("mongoose");

const featureSchema = new mongoose.Schema({
  festivalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Festival",
    required: false,
  },
  name: String,
  enabled: Boolean
});

const Feature = mongoose.model("Feature", featureSchema);

module.exports = Feature;
