const mongoose = require("mongoose");

const WinnerSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
  },
  team: {
    type: String,
    trim: true,
  },
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    default: null,
  },
});

const ResultDetailSchema = new mongoose.Schema({
  position: {
    type: Number,
    required: true,
  },
  winners: [WinnerSchema],
});

const ResultSchema = new mongoose.Schema({
  festivalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Festival",
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: true,
  },
  result: [ResultDetailSchema],
  isPublished: {
    type: Boolean,
    default: true,
  },
});

const Result = mongoose.model("Result", ResultSchema);
module.exports = Result;
