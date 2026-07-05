const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const publicApiController = require("../Controller/publicApiController");
const { validatePublicKey } = require("../middleware/publicAuth");

// Configure Public API rate limiting based on key or IP
const publicApiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60000, // default 1 min
  max: parseInt(process.env.RATE_LIMIT_PUBLIC_MAX, 10) || 100,      // default 100 requests
  validate: { keyGeneratorIpFallback: false },
  keyGenerator: (req) => {
    return req.headers["x-api-key"] || req.ip;
  },
  handler: (req, res) => {
    res.status(429).json({
      msg: "Too many requests, please try again later.",
      status: 429
    });
  }
});

// Apply rate limiter and API key validation middleware to all public endpoints
router.use(publicApiLimiter);
router.use(validatePublicKey);

// Route mappings
router.get("/team-points", publicApiController.getTeamPoints);
router.get("/competitions", publicApiController.getCompetitions);
router.get("/competitions/:competitionId/results", publicApiController.getCompetitionResults);
router.get("/participant-details", publicApiController.getParticipantDetails);
router.get("/participant/:chestNumber", publicApiController.getParticipantDetailsByChestNumber);

module.exports = router;
