const mongoose = require("mongoose");

const brochureImageSchema = new mongoose.Schema({
  path: {
    type: String,
    required: true,
    default:'image'
  },
  public_id: {
    type: String,
    required: true,
    default:'dfasd'
  },
});

const addBrochureSchema = new mongoose.Schema({
  image1:brochureImageSchema,
 image2:brochureImageSchema,
 image3:brochureImageSchema,
 description:{
  type:String,
  default:'Add Your description'
 }
});


const AddBrochureModel = mongoose.model("AddBrochureModel", addBrochureSchema);
module.exports = AddBrochureModel;
