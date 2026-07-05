import axios from "./axios";

// ---------------------------------------------------------------------------
// Program Control
// ---------------------------------------------------------------------------

async function startProgram() {
  const response = await axios.get("/startprogram");
  return response.data;
}

async function checkStartProgram() {
  const response = await axios.get("/checkstatprogram");
  return response.data;
}

async function resetProgram() {
  const response = await axios.get("/resetprogram");
  return response.data;
}

async function checkforResult() {
  const response = await axios.get("/checkstatprogram");
  return response.data;
}

async function stopProgram() {
  const response = await axios.get("/stopprogram");
  return response.data;
}

// ---------------------------------------------------------------------------
// Results
// ---------------------------------------------------------------------------

async function getDataServer(item, category) {
  const response = await axios.get(`/getresult?item=${item}&category=${category}`);
  return response.data;
}

async function getResultImage() {
  const response = await axios.get("/showImage");
  return response.data;
}

async function getResultCount() {
  const response = await axios.get("/result-count");
  return response.data;
}

async function postDataServer(postData) {
  const response = await axios.post("/saveresult", postData);
  return response.data;
}

async function getallresult() {
  const response = await axios.get("/allresult");
  return response.data;
}

async function deleteResult(id) {
  const response = await axios.delete(`/deleteresult/${id}`);
  return response.data;
}

async function togglePublishResult(id) {
  const response = await axios.patch(`/toggleresult/${id}`);
  return response.data;
}

// ---------------------------------------------------------------------------
// Image Upload
// ---------------------------------------------------------------------------

async function ImageUploadServer(formData) {
  const response = await axios.post("/imageUpload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

async function uploadTemplateDynamic(formData) {
  const response = await axios.post("/upload-template-dynamic", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

async function deleteTemplateDynamic(templateId) {
  const response = await axios.delete(`/delete-template-dynamic/${templateId}`);
  return response.data;
}

// ---------------------------------------------------------------------------
// Team Points
// ---------------------------------------------------------------------------

async function getTeamPoint() {
  const response = await axios.get("/teampoint");
  return response.data;
}

async function scoreData(formData, afterCount) {
  const response = await axios.post("/saveteampoint", { formData, afterCount });
  return response.data;
}

// ---------------------------------------------------------------------------
// Descriptions & Brochure
// ---------------------------------------------------------------------------

async function addDescription(description) {
  const response = await axios.put("/adddescription", { description });
  return response.data;
}

async function addTitle(title) {
  const response = await axios.put("/addtitle", { title });
  return response.data;
}

async function getDescription() {
  const response = await axios.get("/getdescription");
  return response.data;
}

async function getBrochure() {
  const response = await axios.get("/getbrochuse");
  return response.data;
}

async function addBrochure(formData) {
  const response = await axios.put("/addbrochure", formData);
  return response.data;
}

// ---------------------------------------------------------------------------
// Teams
// ---------------------------------------------------------------------------

async function addTeamName(teamName) {
  const response = await axios.post("/addteamname", { teamName });
  return response.data;
}

async function getTeam() {
  const response = await axios.get("/getteamname");
  return response.data;
}

async function deleteTeam(teamId) {
  const response = await axios.delete(`/deleteteam/${teamId}`);
  return response.data;
}

async function editTeam(teamId, teamName) {
  const response = await axios.put("/editteam", { teamId, teamName });
  return response.data;
}

// ---------------------------------------------------------------------------
// Gallery
// ---------------------------------------------------------------------------

async function addToGallery(formData, config = {}) {
  const response = await axios.post("/upload-gallery", formData, config);
  return response.data;
}

async function getGallery() {
  const response = await axios.get("/get-gallery");
  return response.data;
}

async function get3fromGallery() {
  const response = await axios.get("/get3-gallery");
  return response.data;
}

async function deleteGalleryImage(id) {
  const response = await axios.delete(`/delete-gallery/${id}`);
  return response.data;
}

// ---------------------------------------------------------------------------
// YouTube / Videos
// ---------------------------------------------------------------------------

async function getYoutubeLink() {
  const response = await axios.get("/getvideo");
  return response.data;
}

async function addYoutubeLink(url) {
  const response = await axios.post("/addvideo", url);
  return response.data;
}

async function deleteYoutubeLink(id) {
  const response = await axios.delete(`/delete-videolink/${id}`);
  return response.data;
}

async function get3YoutubeLink() {
  const response = await axios.get("/get3video");
  return response.data;
}

// ---------------------------------------------------------------------------
// Live Links
// ---------------------------------------------------------------------------

async function saveLiveLink(lives) {
  const response = await axios.post("/savelivelink", lives);
  return response.data;
}

async function getlivelink() {
  const response = await axios.get("/getlivelink");
  return response.data;
}

// ---------------------------------------------------------------------------
// Features
// ---------------------------------------------------------------------------

async function getFeatures() {
  const response = await axios.get("/get-feature");
  return response.data;
}

async function resetFeature() {
  const response = await axios.get("/reset-feature");
  return response.data;
}

async function setfeature(data) {
  const response = await axios.patch("/feature-update", data);
  return response.data;
}

// ---------------------------------------------------------------------------
// News
// ---------------------------------------------------------------------------

async function addtonews(formData) {
  const response = await axios.post("/upload-news", formData);
  return response.data;
}

async function getNews() {
  const response = await axios.get("/get-news");
  return response.data;
}

async function get3News() {
  const response = await axios.get("/get3-news");
  return response.data;
}

async function getOneNews(id) {
  const response = await axios.get(`/get-one-news/${id}`);
  return response.data;
}

async function getRelatedNews(id) {
  const response = await axios.get(`/get-relatednews/${id}`);
  return response.data;
}

async function deleteNews(id) {
  const response = await axios.delete(`/delete-news/${id}`);
  return response.data;
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

async function getSettings() {
  const response = await axios.get("/settings");
  return response.data;
}

async function updateSettings(formData) {
  const response = await axios.put("/settings", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

// ---------------------------------------------------------------------------
// Advertisements
// ---------------------------------------------------------------------------

async function getAds() {
  const response = await axios.get("/get-ads");
  return response.data;
}

async function uploadAd(formData) {
  const response = await axios.post("/upload-ad", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

async function deleteAd(id) {
  const response = await axios.delete(`/delete-ad/${id}`);
  return response.data;
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

/**
 * Formats a festival name with ordinal edition suffix.
 * e.g. edition "3" → "3rd SSF KUTTIKKATOOR Sahityotsav"
 */
function getFullEventTitle(festOrSettings) {
  if (!festOrSettings) return "Sahityotsav";

  const settings = festOrSettings.settings || (festOrSettings.title ? festOrSettings : {});
  const name = festOrSettings.name || "";

  const badgeStr = settings.badge || name || "SSF KUTTIKKATOOR";
  const titleStr = settings.title || "Sahityotsav";

  const defaultEdition = name
    ? name.replace(/[-_]?sahityotsav/gi, "").replace(/[-_]?sahithyotsav/gi, "").trim()
    : "";
  const editionStr = settings.edition || defaultEdition;

  const toOrdinal = (edition) => {
    if (!edition) return "";
    if (/[0-9]+(st|nd|rd|th)$/i.test(edition)) return edition;
    const num = parseInt(edition, 10);
    if (isNaN(num)) return edition;
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return edition + "st";
    if (j === 2 && k !== 12) return edition + "nd";
    if (j === 3 && k !== 13) return edition + "rd";
    return edition + "th";
  };

  const edText = toOrdinal(editionStr);
  return `${edText ? edText + " " : ""}${badgeStr} ${titleStr}`.trim();
}

// ---------------------------------------------------------------------------
// Single-Event Config Resolution
// ---------------------------------------------------------------------------

async function getEventConfig() {
  const response = await axios.get("/auth/event-config");
  return response.data;
}

async function changePassword(oldPassword, newPassword) {
  const response = await axios.post("/auth/change-password", {
    oldPassword,
    newPassword
  });
  return response.data;
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export {
  getEventConfig,
  changePassword,
  getFullEventTitle,
  startProgram,
  checkforResult,
  checkStartProgram,
  resetProgram,
  stopProgram,
  postDataServer,
  getDataServer,
  getResultImage,
  getResultCount,
  ImageUploadServer,
  getallresult,
  deleteResult,
  togglePublishResult,
  getTeamPoint,
  scoreData,
  addDescription,
  addTitle,
  getDescription,
  getBrochure,
  addBrochure,
  addTeamName,
  getTeam,
  deleteTeam,
  editTeam,
  addToGallery,
  getGallery,
  deleteGalleryImage,
  get3fromGallery,
  getYoutubeLink,
  addYoutubeLink,
  deleteYoutubeLink,
  get3YoutubeLink,
  saveLiveLink,
  getlivelink,
  getFeatures,
  resetFeature,
  setfeature,
  addtonews,
  getNews,
  get3News,
  deleteNews,
  getOneNews,
  getRelatedNews,
  getSettings,
  updateSettings,
  getAds,
  uploadAd,
  deleteAd,
  uploadTemplateDynamic,
  deleteTemplateDynamic,
};

async function getPublicCompetitions(apiKey) {
  const response = await axios.get("/public/competitions", {
    headers: { "x-api-key": apiKey }
  });
  return response.data;
}

async function getPublicCompetitionResults(competitionId, apiKey) {
  const response = await axios.get(`/public/competitions/${competitionId}/results`, {
    headers: { "x-api-key": apiKey }
  });
  return response.data;
}

async function getPublicTeamPoints(apiKey) {
  const response = await axios.get("/public/team-points", {
    headers: { "x-api-key": apiKey }
  });
  return response.data;
}

async function regenerateApiKey() {
  const response = await axios.post("/regenerate-api-key");
  return response.data;
}

async function getProxyCompetitions() {
  const response = await axios.get("/external-competitions");
  return response.data;
}

async function getProxyCompetitionResults(competitionId) {
  const response = await axios.get(`/external-results/${competitionId}`);
  return response.data;
}

async function getProxyTeamPoints(teamTypeName = "") {
  const query = teamTypeName ? `/external-teampoints?limit=0&teamTypeName=${encodeURIComponent(teamTypeName)}` : "/external-teampoints?limit=0";
  const response = await axios.get(query);
  return response.data;
}

export {
  getPublicCompetitions,
  getPublicCompetitionResults,
  getPublicTeamPoints,
  regenerateApiKey,
  getProxyCompetitions,
  getProxyCompetitionResults,
  getProxyTeamPoints,
};
