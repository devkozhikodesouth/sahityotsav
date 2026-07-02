const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
  festivalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Festival",
    required: true,
  },
  categoryName: {
    type: String,
    required: true,
  },
});

const Category = mongoose.model("Category", CategorySchema);
module.exports = Category;