const express = require("express");
const router = express.Router();
const authController = require("../Controller/authController");

router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.post("/refresh", authController.refresh);
router.get("/active-festival", authController.resolveActiveFestival);

module.exports = router;
