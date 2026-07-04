const Festival = require("../models/Festival");

const validatePublicKey = async (req, res, next) => {
  try {
    const apiKey = req.headers["x-api-key"];

    if (!apiKey) {
      return res.status(401).json({
        msg: "Unauthorized: API Key (x-api-key header) is missing.",
        status: 401,
        additionalInfo: {}
      });
    }

    const demoKey = "88728aab9ed08b321b6a0d4e7c28db3ae8450696076afb1dfa3573474893e347";
    if (apiKey === demoKey) {
      req.isDemo = true;
      return next();
    }

    const festival = await Festival.findOne();
    
    if (!festival || festival.apiKey !== apiKey.toLowerCase().trim()) {
      return res.status(401).json({
        msg: "Unauthorized: Invalid API Key.",
        status: 401,
        additionalInfo: {}
      });
    }

    if (!festival.externalApiEnabled) {
      return res.status(403).json({
        msg: "Forbidden: External APIs addon entitlement is not enabled for this event.",
        status: 403,
        additionalInfo: {}
      });
    }

    req.festival = festival;
    req.isDemo = false;
    next();
  } catch (err) {
    console.error("Public Auth Middleware Error:", err);
    res.status(500).json({
      msg: "Internal server error.",
      status: 500,
      additionalInfo: { error: err.message }
    });
  }
};

module.exports = { validatePublicKey };
