const YoutubeLink = require("../models/videoModel");
const LiveLink = require("../models/LiveModel");

const getYoutube = async (req, res) => {
  try {
    const link = await YoutubeLink.find().sort({
      createdAt: -1,
    });
    res.json({ url: link });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

const addYoutube = async (req, res) => {
  try {
    const { url } = req.body;
    const newLink = new YoutubeLink({ url });
    await newLink.save();
    res.json({ success: true, url });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

const deleteYoutube = async (req, res) => {
  try {
    const id = req.params.id;

    const result = await YoutubeLink.deleteOne({
      _id: id,
    });

    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Video not found" });
    }

    res.json({ success: true, message: "Video deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

const get3Youtube = async (req, res) => {
  try {
    const link = await YoutubeLink.find()
      .limit(3)
      .sort({ createdAt: -1 });
    res.json({ url: link });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

const updateLiveStreams = async (req, res) => {
  const lives = req.body;

  const cleanUrl = (url) => (url && url.trim() !== "" ? url : "null");

  const live1 = { url: cleanUrl(lives[0]?.url) };
  const live2 = { url: cleanUrl(lives[1]?.url) };

  try {
    let existing = await LiveLink.findOne();

    if (existing) {
      existing.live1.url = live1.url;
      existing.live2.url = live2.url;
      await existing.save();
    } else {
      existing = await LiveLink.create({
        live1,
        live2,
      });
    }

    res.json({ success: true, data: existing });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const getLiveStreams = async (req, res) => {
  try {
    const streams = await LiveLink.findOne();
    res.json({ success: true, data: streams });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch streams" });
  }
};

module.exports = {
  getYoutube,
  addYoutube,
  deleteYoutube,
  get3Youtube,
  updateLiveStreams,
  getLiveStreams,
};