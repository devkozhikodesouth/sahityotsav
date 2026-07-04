const express = require("express");
const router = express.Router();
const authController = require("../Controller/authController");
const { authenticateToken } = require("../middleware/auth");

router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.post("/refresh", authController.refresh);
router.get("/active-festival", authController.resolveActiveFestival);
router.post("/change-password", authenticateToken, authController.changePassword);

module.exports = router;
