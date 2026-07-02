const Brochure = require("../models/Brochure");
const Description = require("../models/ThemeModel");
const cloudinary = require("../util/cloudinary");

const addBrochure = async (req, res) => {
  try {
    const brochureData = await Brochure.findOne({ festivalId: req.tenantId });
    const brochures = ["image1", "image2", "image3"];
    if (brochureData) {
      for (const field of brochures) {
        if (req.files[field]) {
          const newImage = req.files[field][0];

          // Delete previous image
          const existingImage = brochureData[field];
          if (existingImage && existingImage.public_id) {
            try {
              await cloudinary.uploader.destroy(existingImage.public_id);
            } catch (error) {
              console.error("Error deleting brochure image:", error);
            }
          }
          // Update image
          brochureData[field] = {
            path: newImage.path,
            public_id: newImage.filename,
          };
        }
      }
      await brochureData.save();
      return res.status(200).json({ message: "Brochure updated successfully" });
    } else {
      const newBrochure = { festivalId: req.tenantId };
      for (const field of brochures) {
        if (req.files[field]) {
          const file = req.files[field][0];
          newBrochure[field] = {
            path: file.path,
            public_id: file.filename,
          };
        }
      }

      const saveBrochure = new Brochure(newBrochure);
      await saveBrochure.save();
      return res.status(201).json({ message: "Brochure created successfully" });
    }
  } catch (error) {
    console.error("Brochure upload error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

const getBrochuse = async (req, res) => {
  try {
    const getBrochuseData = await Brochure.findOne({ festivalId: req.tenantId });
    return res
      .status(200)
      .json({ message: "Data fetched successfully", data: getBrochuseData });
  } catch (error) {
    console.error("Get brochure error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

const addDescription = async (req, res) => {
  try {
    const { description } = req.body;
    let descriptionData = await Description.findOne({ festivalId: req.tenantId });

    if (descriptionData) {
      descriptionData.description = description;
      await descriptionData.save();
    } else {
      descriptionData = new Description({
        description,
        festivalId: req.tenantId,
      });
      await descriptionData.save();
    }
    res.status(200).json({
      message: "Description added successfully",
      data: descriptionData.description,
    });
  } catch (error) {
    console.error("Add description error:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

const getDescription = async (req, res) => {
  try {
    const descriptionData = await Description.findOne({ festivalId: req.tenantId });
    if (!descriptionData) {
      return res.status(200).json({
        message: "No theme description available",
        data: "",
      });
    }
    return res.status(200).json({
      message: "Description data fetched successfully",
      data: descriptionData.description,
    });
  } catch (error) {
    console.error("Get description error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  addBrochure,
  getBrochuse,
  addDescription,
  getDescription,
};
