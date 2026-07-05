const express = require("express");
const router = express.Router();
const authController = require("../Controller/authController");
const { authenticateToken } = require("../middleware/auth");

const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 login requests per windowMs
  message: {
    success: false,
    message: "Too many login attempts from this IP, please try again after 15 minutes."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/login", loginLimiter, authController.login);
router.post("/logout", authController.logout);
router.post("/refresh", authController.refresh);
router.get("/event-config", authController.getEventConfig);
router.post("/change-password", authenticateToken, authController.changePassword);

module.exports = router;
