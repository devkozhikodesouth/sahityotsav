const mongoose = require("mongoose");

const featureSchema = new mongoose.Schema({
  name: String,
  enabled: Boolean
});

const Feature = mongoose.model("Feature", featureSchema);

module.exports = Feature;
