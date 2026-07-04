const mongoose = require("mongoose");

const CountSchema = new mongoose.Schema({
  festivalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Festival",
    required: false,
  },
  name: { type: String, required: true },
  value: { type: Number, default: 0 }
});

CountSchema.index({ name: 1 }, { unique: true });

const Count = mongoose.model("Count", CountSchema);
module.exports = Count;
