const express = require("express");
const router = express.Router();

const multer = require("../util/mutler.js");
const dataController = require("../Controller/getAndPost.js");
const brochureController = require("../Controller/addBrochure.js");
const teamController = require("../Controller/teamController.js");
const categoryController = require("../Controller/categoryController.js");
const itemController = require("../Controller/itemController.js");
const checkProgramStarted = require("../middleware/program.js");
const {
  saveGalleryImage,
  getAllImages,
  deleteGalleryImage,
  get3Images,
} = require("../Controller/galleryController.js");
const videoController = require("../Controller/videoController.js");
const newsController = require("../Controller/newsController.js");
const adController = require("../Controller/adController.js");

const { authenticateToken } = require("../middleware/auth");

// 1. Mount Auth and Public API routes
const authRoutes = require("./authRoutes");
const publicApiRoutes = require("./publicApiRoutes");

router.use("/auth", authRoutes);
router.use("/public", publicApiRoutes);

// 2. Public Guest routes (NO authentication required)
const guestRouter = express.Router({ mergeParams: true });

guestRouter.get("/checkstatprogram", dataController.checkStartProgram);
guestRouter.get("/getresult", dataController.getData);
guestRouter.get("/showImage", dataController.showImage);
guestRouter.get("/teampoint", dataController.getTeamPoint);
guestRouter.get("/getbrochuse", brochureController.getBrochuse);
guestRouter.get("/getdescription", brochureController.getDescription);
guestRouter.get("/getteamname", teamController.getTeam);
guestRouter.get("/getcategoryname", categoryController.getCategory);
guestRouter.get("/getitemname/:categoryId", itemController.getItem);
guestRouter.get("/getpublisheditemname/:categoryId", itemController.getPublishedItem);
guestRouter.get("/get-gallery", getAllImages);
guestRouter.get("/get3-gallery", get3Images);
guestRouter.get("/getvideo", videoController.getYoutube);
guestRouter.get("/get3video", videoController.get3Youtube);
guestRouter.get("/getlivelink", videoController.getLiveStreams);
guestRouter.get("/get-feature", dataController.getFeature);
guestRouter.get("/get-news", newsController.getAllNews);
guestRouter.get("/get3-news", newsController.get3news);
guestRouter.get("/get-one-news/:id", newsController.getOneNews);
guestRouter.get("/get-relatednews/:id", newsController.getRelatedNews);
guestRouter.get("/result-count", dataController.getResultCount);
guestRouter.get("/get-ads", adController.getAds);
guestRouter.get("/external-competitions", dataController.getExternalCompetitions);
guestRouter.get("/external-results/:competitionId", dataController.getExternalResults);
guestRouter.get("/external-teampoints", dataController.getExternalTeamPoints);
guestRouter.get("/external-participant-details", dataController.getExternalParticipantDetails);

// Mount the guest routes
router.use("/", guestRouter);

// 3. Admin routes (Authentication required)
const adminRouter = express.Router({ mergeParams: true });
adminRouter.use(authenticateToken);

// Read configurations/lists available for admins
adminRouter.get("/checkstatprogram", dataController.checkStartProgram);
adminRouter.get("/getresult", dataController.getData);
adminRouter.get("/showImage", dataController.showImage);
adminRouter.get("/teampoint", dataController.getTeamPoint);
adminRouter.get("/getbrochuse", brochureController.getBrochuse);
adminRouter.get("/getdescription", brochureController.getDescription);
adminRouter.get("/getteamname", teamController.getTeam);
adminRouter.get("/getcategoryname", categoryController.getCategory);
adminRouter.get("/getitemname/:categoryId", itemController.getItem);
adminRouter.get("/getpublisheditemname/:categoryId", itemController.getPublishedItem);
adminRouter.get("/get-gallery", getAllImages);
adminRouter.get("/get3-gallery", get3Images);
adminRouter.get("/getvideo", videoController.getYoutube);
adminRouter.get("/get3video", videoController.get3Youtube);
adminRouter.get("/getlivelink", videoController.getLiveStreams);
adminRouter.get("/get-feature", dataController.getFeature);
adminRouter.get("/get-news", newsController.getAllNews);
adminRouter.get("/get3-news", newsController.get3news);
adminRouter.get("/get-one-news/:id", newsController.getOneNews);
adminRouter.get("/get-relatednews/:id", newsController.getRelatedNews);
adminRouter.get("/result-count", dataController.getResultCount);

// Management Write operations for admins
adminRouter.get("/startprogram", dataController.startProgram);
adminRouter.get("/stopprogram", dataController.stopProgram);
adminRouter.get("/resetprogram", dataController.resetProgram);
adminRouter.post("/imageUpload", multer.templateImagesUpload, dataController.addImage);
adminRouter.post("/upload-template-dynamic", multer.templateSingleUpload, dataController.uploadTemplateDynamic);
adminRouter.delete("/delete-template-dynamic/:templateId", dataController.deleteTemplateDynamic);
adminRouter.get("/allresult", dataController.allResult);
adminRouter.delete("/deleteresult/:id", dataController.deleteResult);
adminRouter.patch("/toggleresult/:id", dataController.togglePublishResult);
adminRouter.post("/saveresult", dataController.postData);
adminRouter.post("/saveteampoint", dataController.saveTeamPoint);

// Brochure image uploads & description updates
adminRouter.put("/addBrochure", multer.brochureImageUpload, brochureController.addBrochure);
adminRouter.put("/adddescription", brochureController.addDescription);

// Teams
adminRouter.post("/addteamname", teamController.addTeam);
adminRouter.put("/editteam", teamController.editTeam);
adminRouter.delete("/deleteteam/:teamId",checkProgramStarted, teamController.deleteTeam);

// Category
adminRouter.post("/addcategoryname", categoryController.addCategory);
adminRouter.delete("/deletecategoryname/:categoryId", checkProgramStarted, categoryController.deletecategory);
adminRouter.put("/editcategoryname", categoryController.editCategoryName);

// Item (Event)
adminRouter.post("/additemname", itemController.addItem);
adminRouter.put("/edititemname", itemController.editItemName);
adminRouter.delete("/deleteitemname/:itemId", checkProgramStarted, itemController.deleteItem);

// Gallery upload & delete
adminRouter.post("/upload-gallery", multer.galleryImagesUpload, saveGalleryImage);
adminRouter.delete("/delete-gallery/:id", deleteGalleryImage);

// Video Upload
adminRouter.post("/addvideo", videoController.addYoutube);
adminRouter.delete("/delete-videolink/:id", videoController.deleteYoutube);

// Live Stream update
adminRouter.post("/savelivelink", videoController.updateLiveStreams);

// Feature config updates
adminRouter.get("/reset-feature", dataController.resetFeature);
adminRouter.patch("/feature-update", dataController.featureUpdate);

// News upload & delete
adminRouter.post("/upload-news", multer.newsImagesUpload, newsController.saveNews);
adminRouter.delete("/delete-news/:id", newsController.deleteNews);

// Ads upload & delete & list
adminRouter.get("/get-ads", adController.getAds);
adminRouter.post("/upload-ad", multer.adsImageUpload, adController.saveAd);
adminRouter.delete("/delete-ad/:id", adController.deleteAd);

// Settings
adminRouter.get("/settings", dataController.getSettings);
adminRouter.put("/settings", multer.settingsImagesUpload, dataController.updateSettings);
adminRouter.post("/regenerate-api-key", dataController.regenerateApiKey);
adminRouter.get("/external-competitions", dataController.getExternalCompetitions);
adminRouter.get("/external-results/:competitionId", dataController.getExternalResults);
adminRouter.get("/external-teampoints", dataController.getExternalTeamPoints);
adminRouter.get("/external-participant-details", dataController.getExternalParticipantDetails);

// Mount the admin routes
router.use("/admin", adminRouter);

module.exports = router;