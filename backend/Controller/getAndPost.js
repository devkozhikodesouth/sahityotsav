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
const Participant = require("../models/Participant");


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

      let resultNumber = 0;
      if (resultData.result && Array.isArray(resultData.result)) {
        resultData.result.forEach(pos => {
          if (Array.isArray(pos.winners)) {
            resultNumber += pos.winners.length;
          }
        });
      }

      return res.status(200).json({
        data: resultData,
        resultNumber: resultNumber,
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

    let templateMode = req.body.templateMode || "fixed";
    let templateRules = [];
    if (req.body.templateRules) {
      try {
        templateRules = JSON.parse(req.body.templateRules);
      } catch (e) {
        // fallback
      }
    }

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

      existingImages.templateMode = templateMode;
      existingImages.templateRules = templateRules;

      if (req.body.templatesMetadata) {
        try {
          const meta = JSON.parse(req.body.templatesMetadata);
          if (Array.isArray(meta)) {
            meta.forEach(m => {
              const matchedTemplate = existingImages.templates.id(m._id);
              if (matchedTemplate) {
                if (m.color) matchedTemplate.color = m.color;
                if (m.positions) matchedTemplate.positions = m.positions;
                if (m.minResultNumber !== undefined) matchedTemplate.minResultNumber = m.minResultNumber;
                if (m.maxResultNumber !== undefined) matchedTemplate.maxResultNumber = m.maxResultNumber;
              }
            });
          }
        } catch (e) {
          console.error("Error parsing templatesMetadata:", e);
        }
      }

      const updatedData = await existingImages.save();
      return res.json({ success: true, data: updatedData });
    } else {
      // Create new image record
      const newImageData = new ImageData({
        ...updatedImages,
        templateMode,
        templateRules
      });
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
    const requiredFeatures = [
      { name: "results", default: true },
      { name: "videos", default: true },
      { name: "live", default: true },
      { name: "teamPoints", default: true },
      { name: "news", default: false },
      { name: "ads", default: false },
      { name: "gallery", default: true },
      { name: "theme", default: false },
      { name: "map", default: false },
      { name: "studentDetails", default: true }
    ];

    if (features.length === 0) {
      features = await Feature.insertMany(
        requiredFeatures.map(rf => ({
          festivalId: req.tenantId,
          name: rf.name,
          enabled: rf.default
        }))
      );
    } else {
      // Find missing features and add them
      const existingNames = features.map(f => f.name);
      const missingFeatures = requiredFeatures.filter(rf => !existingNames.includes(rf.name));
      if (missingFeatures.length > 0) {
        const added = await Feature.insertMany(
          missingFeatures.map(rf => ({
            festivalId: req.tenantId,
            name: rf.name,
            enabled: rf.default
          }))
        );
        features = [...features, ...added];
      }
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
      { festivalId: req.tenantId, name: "studentDetails", enabled: true }
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
      externalBaseUrl: festival.externalBaseUrl || "",
      teamPointsLimit: festival.teamPointsLimit || 0
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
      externalBaseUrl,
      teamPointsLimit
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

    if (teamPointsLimit !== undefined) {
      festival.teamPointsLimit = parseInt(teamPointsLimit, 10) || 0;
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
      externalBaseUrl: festival.externalBaseUrl || "",
      teamPointsLimit: festival.teamPointsLimit || 0
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

    let baseUrl = festival.externalBaseUrl.trim();
    if (baseUrl.endsWith("/")) {
      baseUrl = baseUrl.slice(0, -1);
    }

    const response = await axios.get(`${baseUrl}/public/competitions`, {
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
    let baseUrl = festival.externalBaseUrl.trim();
    if (baseUrl.endsWith("/")) {
      baseUrl = baseUrl.slice(0, -1);
    }

    const response = await axios.get(`${baseUrl}/public/competitions/${competitionId}/results`, {
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

    const limit = (req.query.limit && req.query.limit !== "0") ? req.query.limit : (festival.teamPointsLimit || 0);
    const teamTypeName = req.query.teamTypeName;

    let baseUrl = festival.externalBaseUrl.trim();
    if (baseUrl.endsWith("/")) {
      baseUrl = baseUrl.slice(0, -1);
    }

    let url = `${baseUrl}/public/team-points?limit=${limit}`;
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

const getExternalParticipantDetails = async (req, res) => {
  try {
    const { chestNumber, dob } = req.query;

    if (!chestNumber || !dob) {
      return res.status(400).json({
        msg: "Bad Request: chestNumber and dob are required.",
        status: 400,
        additionalInfo: {}
      });
    }

    const festivalId = req.tenantId;
    const festival = await Festival.findById(festivalId);
    if (!festival) {
      return res.status(404).json({ success: false, message: "Festival not found" });
    }

    // If external API is enabled, proxy the request to the external server
    if (festival.externalApiEnabled && festival.externalBaseUrl) {
      let baseUrl = festival.externalBaseUrl.trim();
      if (baseUrl.endsWith("/")) {
        baseUrl = baseUrl.slice(0, -1);
      }

      const response = await axios.get(`${baseUrl}/public/participant-details`, {
        params: { chestNumber, dob },
        headers: { "x-api-key": festival.externalApiKey }
      });
      return res.status(200).json(response.data);
    }

    // Direct local DB lookup — fallback when external API not enabled
    const participant = await Participant.findOne({
      festivalId,
      chestNumber: { $regex: new RegExp(`^${chestNumber.trim()}$`, "i") },
      dob: dob.trim()
    });

    if (!participant) {
      return res.status(404).json({
        msg: "Participant not found for the provided chest number and date of birth.",
        status: 404,
        additionalInfo: {}
      });
    }

    const competitions = participant.competitions || [];
    const totalCompetitions = competitions.length;
    const completedCompetitions = competitions.filter(c => c.result && c.result.published).length;
    const prizesWon = competitions.filter(c => c.prize && c.prize.exists && c.result && c.result.rank <= 3).length;
    const prizesPendingCollection = competitions.filter(c => c.prize && c.prize.exists && !c.prize.isCollected).length;

    res.status(200).json({
      msg: "Participant details fetched successfully",
      status: 200,
      data: {
        participant: {
          id: participant._id,
          chestNumber: participant.chestNumber,
          fullName: participant.fullName,
          gender: participant.gender,
          category: participant.category,
          teamName: participant.teamName,
          photo: participant.photo,
          eventName: participant.eventName
        },
        competitionOverview: {
          totalCompetitions,
          completedCompetitions,
          prizesWon,
          prizesPendingCollection
        },
        competitions: competitions.map(c => ({
          competitionId: c.competitionId,
          competitionName: c.competitionName,
          result: c.result && c.result.published ? {
            published: true,
            qualified: c.result.qualified,
            rank: c.result.rank,
            grade: c.result.grade,
            point: c.result.point
          } : { published: false },
          prize: c.prize && c.prize.exists ? {
            exists: true,
            title: c.prize.title,
            isCollected: c.prize.isCollected
          } : { exists: false }
        }))
      }
    });
  } catch (error) {
    console.error("Participant Details Error:", error.message);
    res.status(error.response?.status || 500).json(error.response?.data || {
      msg: "Internal server error.",
      status: 500,
      additionalInfo: { error: error.message }
    });
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
  getExternalParticipantDetails,
  uploadTemplateDynamic,
  deleteTemplateDynamic,
};

async function uploadTemplateDynamic(req, res) {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, error: "No image uploaded" });
    }

    let existingImages = await ImageData.findOne({ festivalId: req.tenantId });
    if (!existingImages) {
      existingImages = new ImageData({ festivalId: req.tenantId });
    }

    const newTemplate = {
      image: file.path,
      public_id: file.filename,
      color: "text-black",
      positions: { x: 45, y: 140 },
      minResultNumber: 1,
      maxResultNumber: 10
    };

    existingImages.templates.push(newTemplate);
    const updatedData = await existingImages.save();
    const savedTemplate = updatedData.templates[updatedData.templates.length - 1];
    
    res.status(201).json({ success: true, data: savedTemplate, allTemplates: updatedData.templates });
  } catch (err) {
    console.error("Upload template error:", err);
    res.status(500).json({ success: false, error: "Internal server error", message: err.message });
  }
}

async function deleteTemplateDynamic(req, res) {
  try {
    const { templateId } = req.params;
    const existingImages = await ImageData.findOne({ festivalId: req.tenantId });
    if (!existingImages) {
      return res.status(404).json({ success: false, error: "Record not found" });
    }

    const matchedTemplate = existingImages.templates.id(templateId);
    if (!matchedTemplate) {
      return res.status(404).json({ success: false, error: "Template not found" });
    }

    if (matchedTemplate.public_id) {
      cloudinary.uploader.destroy(matchedTemplate.public_id, (err) => {
        if (err) console.error("Cloudinary deletion error:", err);
      });
    }

    existingImages.templates.pull(templateId);
    existingImages.templateRules = existingImages.templateRules.filter(r => r.templateId !== templateId);

    const updatedData = await existingImages.save();
    res.status(200).json({ success: true, data: updatedData });
  } catch (err) {
    console.error("Delete template error:", err);
    res.status(500).json({ success: false, error: "Internal server error", message: err.message });
  }
}
