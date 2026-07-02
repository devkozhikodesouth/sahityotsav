const mongoose = require("mongoose");

const PositionSchema = new mongoose.Schema({
  x: { type: Number, default: 45 },
  y: { type: Number, default: 140},
}, { _id: false }); // disable _id for subdocs in array

const ImageSchema = new mongoose.Schema({
  image: { type: String, default: "defaultImage.jpg" },
  color: { type: String, default: "light" },
  positions: {
    type: PositionSchema
  },
  public_id: { type: String, default: "adfjkadsfjkal" }
});

const ImageDataSchema = new mongoose.Schema({
  festivalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Festival",
    required: true,
  },
  image1: ImageSchema,
  image2: ImageSchema,
  image3: ImageSchema
});

const ImageData = mongoose.model("ImageData", ImageDataSchema);

module.exports = ImageData;
