const mongoose = require("mongoose");

const CountSchema = new mongoose.Schema({
  name: { type: String, required: true },
  value: { type: Number, default: 0 }
});

CountSchema.index({ name: 1 }, { unique: true });

const Count = mongoose.model("Count", CountSchema);
module.exports = Count;
