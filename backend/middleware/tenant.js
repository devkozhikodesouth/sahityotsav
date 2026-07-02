const mongoose = require("mongoose");
const Festival = require("../models/Festival");

/**
 * Helper to resolve festival tenant context by fetching the default active festival.
 */
const resolveTenantFromRequest = async (req) => {
  // Always return the single active festival document
  let festival = await Festival.findOne({ status: "active" });
  if (!festival) {
    festival = await Festival.findOne();
  }
  return festival;
};

const validateTenantAccess = async (req, res, next) => {
  try {
    const festival = await resolveTenantFromRequest(req);
    if (!festival) {
      return res.status(404).json({
        success: false,
        message: "No active festival found. Please ensure a festival is created in the database.",
      });
    }

    req.tenant = festival;
    req.tenantId = festival._id.toString();
    
    // In single-tenant mode, any authenticated user is allowed to access the single tenant
    next();
  } catch (error) {
    console.error("validateTenantAccess error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const extractTenantContext = async (req, res, next) => {
  try {
    const festival = await resolveTenantFromRequest(req);
    if (!festival) {
      return res.status(404).json({
        success: false,
        message: "No active festival found. Please ensure a festival is created in the database.",
      });
    }

    req.tenant = festival;
    req.tenantId = festival._id.toString();
    next();
  } catch (error) {
    console.error("extractTenantContext error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  validateTenantAccess,
  extractTenantContext,
  resolveTenantFromRequest,
};
