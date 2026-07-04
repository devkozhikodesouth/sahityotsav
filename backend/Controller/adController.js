const Ad = require("../models/adModel");
const cloudinary = require("../util/cloudinary");

const saveAd = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ success: false, error: "No image uploaded" });

    const { title, link, minRank, maxRank, startRange, endRange } = req.body;

    // Use startRange/endRange if provided, otherwise fallback to minRank/maxRank
    const finalStartRange = startRange !== undefined && startRange !== "" ? startRange : minRank;
    const finalEndRange = endRange !== undefined && endRange !== "" ? endRange : maxRank;

    const parsedMinRank = finalStartRange !== undefined && finalStartRange !== "" ? Number(finalStartRange) : null;
    const parsedMaxRank = finalEndRange !== undefined && finalEndRange !== "" ? Number(finalEndRange) : null;

    const newAd = await Ad.create({
      path: file.path, // Cloudinary secure_url
      publicId: file.filename, // Cloudinary public_id
      link: link || "",
      title: title || "",
      minRank: isNaN(parsedMinRank) ? null : parsedMinRank,
      maxRank: isNaN(parsedMaxRank) ? null : parsedMaxRank,
      startRange: isNaN(parsedMinRank) ? null : parsedMinRank,
      endRange: isNaN(parsedMaxRank) ? null : parsedMaxRank,
    });

    res.status(201).json({ success: true, data: newAd });
  } catch (err) {
    console.error("Ad upload error:", err.message);
    res.status(500).json({ success: false, message: "Failed to upload advertisement" });
  }
};

const getAds = async (req, res) => {
  try {
    const ads = await Ad.find().sort({
      createdAt: -1,
    });

    res.status(200).json({ success: true, data: ads });
  } catch (err) {
    console.error("Ad fetch error:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch advertisements" });
  }
};

const deleteAd = async (req, res) => {
  try {
    const id = req.params.id;

    // Find ad scoped to tenant
    const ad = await Ad.findOne({ _id: id });
    if (!ad) {
      return res.status(404).json({ success: false, message: "Advertisement not found" });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(ad.publicId);

    // Delete from MongoDB
    await Ad.findOneAndDelete({ _id: id });

    res.json({ success: true, message: "Advertisement deleted successfully" });
  } catch (err) {
    console.error("Ad deletion failed:", err.message);
    res.status(500).json({ success: false, message: "Failed to delete advertisement" });
  }
};

module.exports = {
  saveAd,
  getAds,
  deleteAd,
};
