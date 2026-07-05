const News = require("../models/newsModel");
const cloudinary = require("../util/cloudinary");

const saveNews = async (req, res) => {
  try {
    const { title, description } = req.body;
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No image uploaded" });

    const result = await cloudinary.uploadStream(file.buffer, "news_Images");

    const newNews = await News.create({
      image: {
        path: result.secure_url, // Cloudinary secure_url
        publicId: result.public_id, // Cloudinary public_id
      },
      title,
      description,
    });

    res.status(201).json({ success: true, data: newNews });
  } catch (err) {
    console.error("Upload error:", err.message);
    res.status(500).json({ success: false, message: "Failed to upload news" });
  }
};

const getAllNews = async (req, res) => {
  try {
    const news = await News.find().sort({
      createdAt: -1,
    });

    res.status(200).json({ success: true, data: news });
  } catch (err) {
    console.error("Fetch error:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch news" });
  }
};

const deleteNews = async (req, res) => {
  try {
    const id = req.params.id;

    // Find news in DB scoped to tenant
    const news = await News.findOne({ _id: id });
    if (!news)
      return res
        .status(404)
        .json({ success: false, message: "News article not found" });

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(news.image.publicId);

    // Delete from MongoDB
    await News.findOneAndDelete({ _id: id });

    res.json({ success: true, message: "News deleted from DB and Cloudinary" });
  } catch (err) {
    console.error("Delete failed:", err.message);
    res.status(500).json({ success: false, message: "Delete failed" });
  }
};

const get3news = async (req, res) => {
  try {
    const news = await News.find()
      .sort({ createdAt: -1 })
      .limit(3);

    res.status(200).json({ success: true, data: news });
  } catch (err) {
    console.error("Fetch error:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch news" });
  }
};

const getOneNews = async (req, res) => {
  try {
    const id = req.params.id;

    const news = await News.findOne({ _id: id });
    if (!news) {
      return res
        .status(404)
        .json({ success: false, message: "News article not found" });
    }

    res.status(200).json({ success: true, data: news });
  } catch (err) {
    console.error("Fetch error:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch news details" });
  }
};

const getRelatedNews = async (req, res) => {
  try {
    const id = req.params.id;

    const relatedNews = await News.find({
      _id: { $ne: id },
    })
      .sort({ createdAt: -1 })
      .limit(3);

    res.status(200).json({ success: true, data: relatedNews });
  } catch (err) {
    console.error("Fetch error:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch related news" });
  }
};

module.exports = {
  saveNews,
  getAllNews,
  deleteNews,
  get3news,
  getOneNews,
  getRelatedNews,
};