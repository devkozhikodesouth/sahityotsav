const Gallery = require("../models/galleryModel");
const cloudinary = require("../util/cloudinary");

const saveGalleryImage = async (req, res) => {
  try {
    let files = [];
    if (req.file) {
      files.push(req.file);
    }
    if (req.files) {
      if (req.files["image"]) files = files.concat(req.files["image"]);
      if (req.files["images[]"]) files = files.concat(req.files["images[]"]);
      if (req.files["images"]) files = files.concat(req.files["images"]);
    }

    if (files.length === 0) {
      return res.status(400).json({ success: false, error: "No image uploaded" });
    }

    const uploaded = [];
    const failed = [];
    const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const maxFileSize = 10 * 1024 * 1024; // 10MB

    for (const file of files) {
      try {
        // Validate MIME type
        if (!allowedMimeTypes.includes(file.mimetype)) {
          failed.push({
            file: file.originalname,
            reason: "Invalid file type. Only JPG, JPEG, PNG, and WEBP are allowed.",
          });
          continue;
        }

        // Validate File Size
        if (file.size > maxFileSize) {
          failed.push({
            file: file.originalname,
            reason: "File size exceeds 10MB limit.",
          });
          continue;
        }

        // Upload to Cloudinary via stream
        const cloudinaryResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "gallery_Images" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(file.buffer);
        });

        // Save to MongoDB
        const newImage = await Gallery.create({
          path: cloudinaryResult.secure_url,
          publicId: cloudinaryResult.public_id,
        });

        uploaded.push({
          id: newImage._id,
          url: newImage.path,
          publicId: newImage.publicId,
        });
      } catch (err) {
        console.error(`Error uploading file ${file.originalname}:`, err.message);
        failed.push({
          file: file.originalname,
          reason: err.message || "Failed to upload to Cloudinary",
        });
      }
    }

    res.status(201).json({
      success: true,
      uploaded,
      failed,
      data: uploaded.length > 0 ? {
        _id: uploaded[0].id,
        path: uploaded[0].url,
        publicId: uploaded[0].publicId
      } : null,
    });
  } catch (err) {
    console.error("Upload error:", err.message);
    res.status(500).json({ success: false, message: "Failed to upload image" });
  }
};

const getAllImages = async (req, res) => {
  try {
    const images = await Gallery.find().sort({
      createdAt: -1,
    });

    res.status(200).json({ success: true, data: images });
  } catch (err) {
    console.error("Fetch error:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch images" });
  }
};

const deleteGalleryImage = async (req, res) => {
  try {
    const id = req.params.id;

    // Find image in DB scoped to tenant
    const image = await Gallery.findOne({ _id: id });
    if (!image)
      return res
        .status(404)
        .json({ success: false, message: "Image not found" });

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(image.publicId);

    // Delete from MongoDB
    await Gallery.findOneAndDelete({ _id: id });

    res.json({ success: true, message: "Image deleted from DB and Cloudinary" });
  } catch (err) {
    console.error("Delete failed:", err.message);
    res.status(500).json({ success: false, message: "Delete failed" });
  }
};

const get3Images = async (req, res) => {
  try {
    const images = await Gallery.find()
      .sort({ createdAt: -1 })
      .limit(3);

    res.status(200).json({ success: true, data: images });
  } catch (err) {
    console.error("Fetch error:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch images" });
  }
};

module.exports = {
  saveGalleryImage,
  getAllImages,
  deleteGalleryImage,
  get3Images,
};