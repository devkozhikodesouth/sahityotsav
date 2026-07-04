const mongoose = require("mongoose");

const FestivalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    logo: {
      type: String,
      default: null,
    },
    banner: {
      type: String,
      default: null,
    },
    theme: {
      primaryColor: { type: String, default: "#3B82F6" },
      secondaryColor: { type: String, default: "#1D4ED8" },
      backgroundColor: { type: String, default: "#F3F4F6" },
      isDarkModeEnabled: { type: Boolean, default: false },
    },
    featureConfig: {
      results: { type: Boolean, default: true },
      videos: { type: Boolean, default: true },
      live: { type: Boolean, default: true },
      teamPoints: { type: Boolean, default: true },
      news: { type: Boolean, default: true },
      gallery: { type: Boolean, default: true },
      theme: { type: Boolean, default: true },
      downloads: { type: Boolean, default: true },
    },
    status: {
      type: String,
      enum: ["active", "pending_approval", "suspended"],
      default: "pending_approval",
    },
    settings: {
      date: { type: String, default: "Coming Soon" },
      venue: { type: String, default: "Main Venue" },
      description: { type: String, default: "A grand celebration of literature, culture, creativity, and talent. Experience two unforgettable days filled with inspiring performances, competitions, and artistic excellence." },
      badge: { type: String, default: "" },
      title: { type: String, default: "Sahityotsav" },
      edition: { type: String, default: "" },
      programsCount: { type: String, default: "140+" },
      participantsCount: { type: String, default: "300+" },
      bannerImage: { type: String, default: "" },
      rightImage: { type: String, default: "" },
      instagram: { type: String, default: "" },
      whatsapp: { type: String, default: "" },
      facebook: { type: String, default: "" },
      youtube: { type: String, default: "" },
      footerText: { type: String, default: "" },
      mapLink: { type: String, default: "" },
    },


    externalApiEnabled: {
      type: Boolean,
      default: false,
    },
    apiKey: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    externalApiKey: {
      type: String,
      trim: true,
    },
    externalBaseUrl: {
      type: String,
      trim: true,
    },
    teamPointsLimit: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);




const Festival = mongoose.model("Festival", FestivalSchema);
module.exports = Festival;
