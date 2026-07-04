const mongoose = require("mongoose");

const addDescriptionSchema = new mongoose.Schema({
  festivalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Festival",
    required: false,
  },
  description: {
    type: String,
    required: true,
    default:'add Theme of the fest'
  }
});

const addDescriptionModel = mongoose.model("Description", addDescriptionSchema);

module.exports =   addDescriptionModel

