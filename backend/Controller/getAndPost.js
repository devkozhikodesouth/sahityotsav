const Result = require("../models/resultModel");
const ImageData = require("../models/imageDataModel");
const TeamPoint = require("../models/teamPointModel");
const { default: mongoose } = require("mongoose");
const axios = require("axios");
const Category = require("../models/CategoryModel");
const Item = require("../models/itemModel");
const startProgramModel = require("../models/startProgram");
const AddBrochureModel = require("../models/Brochure");
const Team = require("../models/Team");
const addDescriptionModel = require("../models/ThemeModel");
const Feature = require("../models/featureSchema");
const LiveLink = require("../models/LiveModel");
const Count = require("../models/Count");
const Festival = require("../models/Festival");


const cloudinary = require("cloudinary").v2;
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const startProgram = async (req, res) => {
  try {
    const program = await startProgramModel.findOneAndUpdate(
      { festivalId: req.tenantId },
      { startProgram: true },
      { upsert: true, new: true }
    );

    if (program) {
      res.status(200).json({
        success: true,
        message: "Program started",
      });
    }
  } catch (error) {
    console.error("Error starting program:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const stopProgram = async (req, res) => {
  try {
    const program = await startProgramModel.findOneAndUpdate(
      { festivalId: req.tenantId },
      { startProgram: false },
      { upsert: true, new: true }
    );

    // Delete all results for this festival
    const deleteAllResult = await Result.deleteMany({ festivalId: req.tenantId });

    if (program && deleteAllResult) {
      res.status(200).json({
        success: true,
        message: "Program stopped",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Program stopping failed",
      });
    }
  } catch (error) {
    console.error("Error stopping program:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const resetProgram = async (req, res) => {
  try {
    const program = await startProgramModel.findOneAndUpdate(
      { festivalId: req.tenantId },
      { startProgram: false },
      { upsert: true, new: true }
    );

    // Delete all data associated with this festival
    const [
      resultDel,
      teamDel,
      pointDel,
      categoryDel,
      descDel,
      itemDel,
      featureDel,
      liveDel,
      countDel,
    ] = await Promise.all([
      Result.deleteMany({ festivalId: req.tenantId }),
      Team.deleteMany({ festivalId: req.tenantId }),
      TeamPoint.deleteMany({ festivalId: req.tenantId }),
      Category.deleteMany({ festivalId: req.tenantId }),
      addDescriptionModel.deleteMany({ festivalId: req.tenantId }),
      Item.deleteMany({ festivalId: req.tenantId }),
      Feature.deleteMany({ festivalId: req.tenantId }),
      LiveLink.deleteMany({ festivalId: req.tenantId }),
      Count.deleteMany({ festivalId: req.tenantId }),
    ]);

    const allSuccessful =
      program &&
      resultDel.acknowledged &&
      teamDel.acknowledged &&
      pointDel.acknowledged &&
      categoryDel.acknowledged &&
      descDel.acknowledged &&
      itemDel.acknowledged &&
      featureDel.acknowledged &&
      liveDel.acknowledged;

    if (allSuccessful) {
      res.status(200).json({
        success: true,
        message: "Program reset successfully",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Program reset failed",
      });
    }
  } catch (error) {
    console.error("Error resetting program:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const checkStartProgram = async (req, res) => {
  try {
    let program = await startProgramModel.findOne({ festivalId: req.tenantId });

    if (!program) {
      program = await startProgramModel.create({
        festivalId: req.tenantId,
        startProgram: false,
      });
    }

    res.status(200).json({
      success: program.startProgram,
    });
  } catch (error) {
    console.error("Error checking program status:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getData = async (req, res) => {
  try {
    const { category, item } = req.query;

    const resultData = await Result.findOne({
      category,
      item,
      festivalId: req.tenantId,
    })
      .populate("category item")
      .populate("result.winners.teamId");

    if (resultData && resultData.isPublished !== false) {
      try {
        await Count.findOneAndUpdate(
          { name: "resultViews", festivalId: new mongoose.Types.ObjectId(req.tenantId) },
          { $inc: { value: 1 } },
          { upsert: true }
        );
      } catch (countError) {
        console.error("Error updating count:", countError);
      }

      return res.status(200).json({
        data: resultData,
        success: true,
      });
    } else {
      const itemData = await Item.findOne({
        categoryName: category,
        _id: item,
        festivalId: req.tenantId,
      }).populate("categoryName");

      return res.status(200).json({
        data: {
          category: {
            categoryName: itemData?.categoryName?.categoryName || "",
          },
          item: {
            itemName: itemData?.itemName || "",
          },
          result: false,
        },
        success: false,
        message: "Not published",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const addImage = async (req, res) => {
  try {
    let colors = [];
    try {
      colors = JSON.parse(req.body.color);
    } catch (e) {
      colors = req.body.color?.split(",") || [];
    }

    let positions = [];
    try {
      positions = JSON.parse(req.body.positions);
    } catch (e) {
      // fallback
    }
    const existingImages = await ImageData.findOne({ festivalId: req.tenantId });

    const images = ["image1", "image2", "image3"];
    const updatedImages = { festivalId: req.tenantId };

    images.forEach((imageKey, index) => {
      const file = req.files?.[imageKey]?.[0];

      updatedImages[imageKey] = {
        image: null,
        public_id: null,
        positions: positions[index] || { x: 45, y: 140 },
        color: colors[index] || "text-black",
      };

      if (file) {
        updatedImages[imageKey].image = file.path;
        updatedImages[imageKey].public_id = file.filename;
      }
    });

    if (existingImages) {
      // Update existing document
      images.forEach((imageKey, index) => {
        const file = req.files?.[imageKey]?.[0];

        if (file && existingImages[imageKey]?.public_id) {
          cloudinary.uploader.destroy(existingImages[imageKey].public_id, (err) => {
            if (err) console.error("Error deleting image:", err);
          });
        }

        existingImages[imageKey].image =
          updatedImages[imageKey].image || existingImages[imageKey].image;

        existingImages[imageKey].public_id =
          updatedImages[imageKey].public_id || existingImages[imageKey].public_id;

        existingImages[imageKey].positions = updatedImages[imageKey].positions;
        existingImages[imageKey].color = updatedImages[imageKey].color;
      });

      const updatedData = await existingImages.save();
      return res.json({ success: true, data: updatedData });
    } else {
      // Create new image record
      const newImageData = new ImageData(updatedImages);
      await newImageData.save();
      return res.json({ success: true, data: newImageData });
    }
  } catch (error) {
    console.error("Add Image Error:", error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

const showImage = async (req, res) => {
  try {
    const savedData = await ImageData.findOne({ festivalId: req.tenantId });
    res.json({ data: savedData || null });
  } catch (error) {
    console.error("Show Image Error:", error.message);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

const postData = async (req, res) => {
  try {
    const {
      categoryId,
      itemId,
      firstPrize,
      firstTeam,
      secPrize,
      secTeam,
      thirdPrize,
      thirdTeam,
      firstPlace,
      secondPlace,
      thirdPlace,
    } = req.body;
    let resultData = [];

    if (firstPlace || secondPlace || thirdPlace) {
      // New structure for multiple winners
      resultData = [
        { position: 1, winners: firstPlace || [] },
        { position: 2, winners: secondPlace || [] },
        { position: 3, winners: thirdPlace || [] },
      ];
    } else {
      // Old structure for backwards compatibility if needed
      if (firstPrize !== undefined && firstTeam !== undefined) {
        resultData.push({ firstPrize, firstTeam });
      }
      if (secPrize !== undefined && secTeam !== undefined) {
        resultData.push({ secPrize, secTeam });
      }
      if (thirdPrize !== undefined && thirdTeam !== undefined) {
        resultData.push({ thirdPrize, thirdTeam });
      }
    }

    const existingData = await Result.findOne({
      category: categoryId,
      item: itemId,
      festivalId: req.tenantId,
    });

    if (existingData) {
      existingData.result = resultData;
      await existingData.save();
      res.status(200).json({ message: "Data updated successfully" });
    } else {
      const newResult = new Result({
        festivalId: req.tenantId,
        category: categoryId,
        item: itemId,
        result: resultData,
      });
      await newResult.save();
      res.status(201).json({ message: "Data saved successfully" });
    }
  } catch (error) {
    console.error("Post Data Error:", error);
    res.status(400).json({ message: error.message });
  }
};

const allResult = async (req, res) => {
  try {
    const allData = await Result.find({ festivalId: req.tenantId })
      .populate("category item")
      .populate("result.winners.teamId");

    if (allData.length > 0) {
      res.status(200).json({ success: true, data: allData });
    } else {
      res.status(404).json({ success: false, message: "No results found" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

const deleteResult = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedResult = await Result.findOneAndDelete({
      _id: id,
      festivalId: req.tenantId,
    });
    if (deletedResult) {
      res.status(200).json({ success: true, message: "Result deleted successfully" });
    } else {
      res.status(404).json({ success: false, message: "Result not found" });
    }
  } catch (error) {
    console.error("Error deleting result:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const togglePublishResult = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Result.findOne({ _id: id, festivalId: req.tenantId });
    if (!result) {
      return res.status(404).json({ success: false, message: "Result not found" });
    }

    result.isPublished = result.isPublished === false ? true : false;
    await result.save();

    res.status(200).json({
      success: true,
      message: `Result ${result.isPublished ? "published" : "unpublished"} successfully`,
      isPublished: result.isPublished,
    });
  } catch (error) {
    console.error("Error toggling result publish state:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const saveTeamPoint = async (req, res) => {
  try {
    let teamData = await TeamPoint.findOne({ festivalId: req.tenantId });

    const input = req.body.formData;
    const afterCount = req.body.afterCount;

    if (!teamData) {
      teamData = new TeamPoint({
        festivalId: req.tenantId,
        results: [],
        afterCount,
      });
    }

    for (const { team, point } of input) {
      const teamObjectId = new mongoose.Types.ObjectId(team._id);
      const existingTeam = teamData.results.find((result) =>
        result.team.equals(teamObjectId)
      );
      if (existingTeam) {
        existingTeam.point = Number(point);
      } else {
        teamData.results.push({
          team: teamObjectId,
          point: Number(point),
        });
      }
    }
    teamData.afterCount = afterCount;
    const savedData = await teamData.save();

    if (savedData) {
      res.status(200).json({ message: true });
    } else {
      res.status(400).json({ message: "No changes made." });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: error.message });
  }
};

const getTeamPoint = async (req, res) => {
  try {
    const data = await TeamPoint.findOne({ festivalId: req.tenantId }).populate(
      "results.team"
    );

    if (data && data?.results?.length > 0) {
      // Filter out entries where the team was deleted (ref populates as null)
      const validResults = data.results.filter(item => item.team);
      const sortedResults = validResults.sort(
        (a, b) => parseInt(b.point) - parseInt(a.point)
      );
      const afterCount = data.afterCount;
      res.status(200).json({ success: true, data: { sortedResults, afterCount } });
    } else {
      res.status(200).json({ success: false, message: "No data Available" });
    }
  } catch (error) {
    console.error("Error fetching team points:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

const featureUpdate = async (req, res) => {
  const { name, enabled } = req.body;

  if (typeof enabled !== "boolean") {
    return res.status(400).json({ message: "`enabled` must be a boolean" });
  }

  try {
    const updatedFeature = await Feature.findOneAndUpdate(
      { name, festivalId: req.tenantId },
      { enabled },
      { new: true, upsert: true }
    );

    res.status(200).json(updatedFeature);
  } catch (error) {
    res.status(500).json({ message: "Failed to update feature", error });
  }
};

const getFeature = async (req, res) => {
  try {
    let features = await Feature.find({ festivalId: req.tenantId });
    if (features.length === 0) {
      features = await Feature.insertMany([
        { festivalId: req.tenantId, name: "results", enabled: true },
        { festivalId: req.tenantId, name: "videos", enabled: true },
        { festivalId: req.tenantId, name: "live", enabled: true },
        { festivalId: req.tenantId, name: "teamPoints", enabled: true },
        { festivalId: req.tenantId, name: "news", enabled: false },
        { festivalId: req.tenantId, name: "ads", enabled: false },
        { festivalId: req.tenantId, name: "gallery", enabled: true },
        { festivalId: req.tenantId, name: "theme", enabled: false },
        { festivalId: req.tenantId, name: "map", enabled: false },
      ]);
    }
    res.status(200).json(features);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch features", error });
  }
};

const resetFeature = async (req, res) => {
  try {
    // Clear all existing features for this festival
    await Feature.deleteMany({ festivalId: req.tenantId });

    // Insert default features for this festival
    const defaultFeatures = await Feature.insertMany([
      { festivalId: req.tenantId, name: "results", enabled: true },
      { festivalId: req.tenantId, name: "videos", enabled: true },
      { festivalId: req.tenantId, name: "live", enabled: true },
      { festivalId: req.tenantId, name: "teamPoints", enabled: true },
      { festivalId: req.tenantId, name: "news", enabled: false },
      { festivalId: req.tenantId, name: "ads", enabled: false },
      { festivalId: req.tenantId, name: "gallery", enabled: true },
      { festivalId: req.tenantId, name: "theme", enabled: false },
      { festivalId: req.tenantId, name: "map", enabled: false },
    ]);

    res.status(200).json({
      message: "Features reset successfully",
      features: defaultFeatures,
    });
  } catch (error) {
    console.error("Reset Feature Error:", error);
    res.status(500).json({ message: "Failed to reset features", error });
  }
};

const getResultCount = async (req, res) => {
  try {
    const countDoc = await Count.findOne({
      name: "resultViews",
      festivalId: new mongoose.Types.ObjectId(req.tenantId),
    });
    const count = countDoc ? countDoc.value : 0;
    res.status(200).json({ success: true, count });
  } catch (error) {
    console.error("Error fetching result count:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getSettings = async (req, res) => {
  try {
    const festival = await Festival.findById(req.tenantId);
    if (!festival) {
      return res.status(404).json({ success: false, message: "Festival not found" });
    }
    res.status(200).json({
      success: true,
      settings: festival.settings || {},
      externalApiEnabled: festival.externalApiEnabled || false,
      apiKey: festival.apiKey || null,
      externalApiKey: festival.externalApiKey || "",
      externalBaseUrl: festival.externalBaseUrl || ""
    });
  } catch (error) {
    console.error("Error getting settings:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const updateSettings = async (req, res) => {
  try {
    const festival = await Festival.findById(req.tenantId);
    if (!festival) {
      return res.status(404).json({ success: false, message: "Festival not found" });
    }

    if (!festival.settings) {
      festival.settings = {};
    }

    const {
      date,
      venue,
      description,
      badge,
      title,
      edition,
      programsCount,
      participantsCount,
      instagram,
      whatsapp,
      facebook,
      youtube,
      footerText,
      mapLink,
      externalApiEnabled,
      externalApiKey,
      externalBaseUrl
    } = req.body;

    if (date !== undefined) festival.settings.date = date;
    if (venue !== undefined) festival.settings.venue = venue;
    if (description !== undefined) festival.settings.description = description;
    if (badge !== undefined) festival.settings.badge = badge;
    if (title !== undefined) festival.settings.title = title;
    if (edition !== undefined) festival.settings.edition = edition;
    if (programsCount !== undefined) festival.settings.programsCount = programsCount;
    if (participantsCount !== undefined) festival.settings.participantsCount = participantsCount;
    if (instagram !== undefined) festival.settings.instagram = instagram;
    if (whatsapp !== undefined) festival.settings.whatsapp = whatsapp;
    if (facebook !== undefined) festival.settings.facebook = facebook;
    if (youtube !== undefined) festival.settings.youtube = youtube;
    if (footerText !== undefined) festival.settings.footerText = footerText;
    if (mapLink !== undefined) festival.settings.mapLink = mapLink;

    if (externalApiEnabled !== undefined) {
      const enabled = externalApiEnabled === "true" || externalApiEnabled === true;
      festival.externalApiEnabled = enabled;
    }

    if (externalApiKey !== undefined) {
      festival.externalApiKey = externalApiKey;
    }

    if (externalBaseUrl !== undefined) {
      festival.externalBaseUrl = externalBaseUrl;
    }

    if (req.files) {
      if (req.files.bannerImage && req.files.bannerImage[0]) {
        festival.settings.bannerImage = req.files.bannerImage[0].path;
      }
      if (req.files.rightImage && req.files.rightImage[0]) {
        festival.settings.rightImage = req.files.rightImage[0].path;
      }
    }

    festival.markModified("settings");
    await festival.save();

    res.status(200).json({
      success: true,
      message: "Settings updated successfully",
      settings: festival.settings,
      externalApiEnabled: festival.externalApiEnabled || false,
      apiKey: festival.apiKey || null,
      externalApiKey: festival.externalApiKey || "",
      externalBaseUrl: festival.externalBaseUrl || ""
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



const regenerateApiKey = async (req, res) => {
  try {
    const festival = await Festival.findById(req.tenantId);
    if (!festival) {
      return res.status(404).json({ success: false, message: "Festival not found" });
    }

    const crypto = require("crypto");
    festival.apiKey = crypto.randomBytes(32).toString("hex");
    await festival.save();

    res.status(200).json({
      success: true,
      message: "API Key regenerated successfully! Key has been updated.",
      apiKey: festival.apiKey
    });
  } catch (error) {
    console.error("Error regenerating API key:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getExternalCompetitions = async (req, res) => {
  try {
    const festival = await Festival.findById(req.tenantId);
    if (!festival) {
      return res.status(404).json({ success: false, message: "Festival not found" });
    }
    if (!festival.externalApiEnabled || !festival.externalBaseUrl) {
      return res.status(400).json({ success: false, message: "External API integration is not enabled" });
    }

    const response = await axios.get(`${festival.externalBaseUrl}/public/competitions`, {
      headers: { "x-api-key": festival.externalApiKey }
    });
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Proxy Competitions Error:", error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { success: false, message: "Proxy fetch failed" });
  }
};

const getExternalResults = async (req, res) => {
  try {
    const festival = await Festival.findById(req.tenantId);
    if (!festival) {
      return res.status(404).json({ success: false, message: "Festival not found" });
    }
    if (!festival.externalApiEnabled || !festival.externalBaseUrl) {
      return res.status(400).json({ success: false, message: "External API integration is not enabled" });
    }

    const { competitionId } = req.params;
    const response = await axios.get(`${festival.externalBaseUrl}/public/competitions/${competitionId}/results`, {
      headers: { "x-api-key": festival.externalApiKey }
    });
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Proxy Results Error:", error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { success: false, message: "Proxy fetch failed" });
  }
};

const getExternalTeamPoints = async (req, res) => {
  try {
    const festival = await Festival.findById(req.tenantId);
    if (!festival) {
      return res.status(404).json({ success: false, message: "Festival not found" });
    }
    if (!festival.externalApiEnabled || !festival.externalBaseUrl) {
      return res.status(400).json({ success: false, message: "External API integration is not enabled" });
    }

    const limit = req.query.limit !== undefined ? req.query.limit : 0;
    const teamTypeName = req.query.teamTypeName;
    let url = `${festival.externalBaseUrl}/public/team-points?limit=${limit}`;
    if (teamTypeName) {
      url += `&teamTypeName=${teamTypeName}`;
    }

    const response = await axios.get(url, {
      headers: { "x-api-key": festival.externalApiKey }
    });
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Proxy Team Points Error:", error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { success: false, message: "Proxy fetch failed" });
  }
};

module.exports = {
  startProgram,
  checkStartProgram,
  stopProgram,
  resetProgram,
  getData,
  getResultCount,
  addImage,
  postData,
  showImage,
  allResult,
  deleteResult,
  togglePublishResult,
  saveTeamPoint,
  getTeamPoint,
  featureUpdate,
  getFeature,
  resetFeature,
  getSettings,
  updateSettings,
  regenerateApiKey,
  getExternalCompetitions,
  getExternalResults,
  getExternalTeamPoints,
};
