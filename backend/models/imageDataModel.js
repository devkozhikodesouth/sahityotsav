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
  image1: ImageSchema,
  image2: ImageSchema,
  image3: ImageSchema,
  templateMode: {
    type: String,
    enum: ["fixed", "countBased"],
    default: "fixed"
  },
  templates: [
    {
      image: { type: String, required: true },
      color: { type: String, default: "text-black" },
      positions: {
        type: PositionSchema,
        default: () => ({ x: 45, y: 140 })
      },
      public_id: { type: String, required: true },
      minResultNumber: { type: Number, default: 1 },
      maxResultNumber: { type: Number, default: 10 }
    }
  ],
  templateRules: [
    {
      templateId: { type: String, required: true }, // References template _id inside the templates array
      minResultNumber: { type: Number, required: true },
      maxResultNumber: { type: Number, required: true }
    }
  ]
});

const ImageData = mongoose.model("ImageData", ImageDataSchema);

module.exports = ImageData;
