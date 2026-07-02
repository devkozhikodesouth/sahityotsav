const User = require("../models/User");
const Festival = require("../models/Festival");
const jwt = require("jsonwebtoken");

// JWT Helpers
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      username: user.username,
      role: user.role,
    },
    process.env.ACCESS_TOKEN_SECRET || "85adfb4a1cf648fb9eededf3be99702_access_secret_key_1293",
    { expiresIn: "15m" }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET || "85adfb4a1cf648fb9eededf3be99702_refresh_secret_key_1293", {
    expiresIn: "7d",
  });
};

const getCookieOptions = (req) => {
  const host = req.headers["x-forwarded-host"] || req.headers.host || "";
  const cleanHost = host.split(":")[0].toLowerCase().trim();
  const isLocalhost = cleanHost.includes("localhost") || cleanHost.includes("127.0.0.1");
  const isSecure = req.secure || req.headers["x-forwarded-proto"] === "https";

  return {
    httpOnly: true,
    secure: isLocalhost ? true : isSecure,
    sameSite: (isLocalhost || isSecure) ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };
};

const getClearCookieOptions = (req) => {
  const host = req.headers["x-forwarded-host"] || req.headers.host || "";
  const cleanHost = host.split(":")[0].toLowerCase().trim();
  const isLocalhost = cleanHost.includes("localhost") || cleanHost.includes("127.0.0.1");
  const isSecure = req.secure || req.headers["x-forwarded-proto"] === "https";

  return {
    httpOnly: true,
    secure: isLocalhost ? true : isSecure,
    sameSite: (isLocalhost || isSecure) ? "none" : "lax",
  };
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Username and password are required" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    if (user.status === "disabled") {
      return res.status(403).json({
        success: false,
        message: "Your account is disabled. Please contact the administrator.",
      });
    }

    // Check account lock status
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(423).json({
        success: false,
        message: `Account temporarily locked. Try again in ${minutesLeft} minutes.`,
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      // Brute force protection logic
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= 5) {
        user.lockUntil = Date.now() + 15 * 60 * 1000; // Lock for 15 minutes
        user.failedLoginAttempts = 0; // Reset counter
      }
      await user.save();

      return res.status(401).json({
        success: false,
        message:
          user.failedLoginAttempts >= 5
            ? "Account locked for 15 minutes due to multiple failed logins."
            : "Invalid credentials",
      });
    }

    // Successful login: reset failed login tracking
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refresh token to user (Refresh Token Rotation array)
    user.refreshTokens.push(refreshToken);
    // Limit stored refresh tokens (max 10 devices)
    if (user.refreshTokens.length > 10) {
      user.refreshTokens.shift();
    }
    await user.save();

    // Set secure httpOnly cookie for refresh token
    res.cookie("refreshToken", refreshToken, getCookieOptions(req));

    res.status(200).json({
      success: true,
      accessToken,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      // Remove refresh token from database
      await User.findOneAndUpdate(
        { refreshTokens: refreshToken },
        { $pull: { refreshTokens: refreshToken } }
      );
    }

    // Clear refresh token cookie
    res.clearCookie("refreshToken", getClearCookieOptions(req));

    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res
        .status(401)
        .json({ success: false, message: "Refresh token is missing" });
    }

    // Verify token validity
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || "85adfb4a1cf648fb9eededf3be99702_refresh_secret_key_1293");
    } catch (err) {
      return res
        .status(403)
        .json({ success: false, message: "Invalid or expired refresh token" });
    }

    const user = await User.findById(decoded.id);
    if (!user || user.status === "disabled") {
      res.clearCookie("refreshToken", getClearCookieOptions(req));
      return res.status(403).json({
        success: false,
        message: "User account does not exist or has been disabled.",
      });
    }

    // Check if refresh token is in active rotation array
    const tokenIndex = user.refreshTokens.indexOf(refreshToken);
    if (tokenIndex === -1) {
      // Replay attack! Token is reused/stolen.
      // Revoke all refresh tokens for security breach response
      user.refreshTokens = [];
      await user.save();
      res.clearCookie("refreshToken", getClearCookieOptions(req));
      return res.status(403).json({
        success: false,
        message: "Security violation: Replay attack detected. Sessions terminated.",
      });
    }

    // Generate new pair (Refresh Token Rotation)
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Replace old refresh token with new one
    user.refreshTokens[tokenIndex] = newRefreshToken;
    await user.save();

    res.cookie("refreshToken", newRefreshToken, getCookieOptions(req));

    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const resolveActiveFestival = async (req, res) => {
  try {
    let festival = await Festival.findOne({ status: "active" });
    if (!festival) {
      festival = await Festival.findOne();
    }

    if (!festival) {
      return res.status(404).json({
        success: false,
        message: "No active festival found."
      });
    }

    res.status(200).json({ success: true, data: festival });
  } catch (error) {
    console.error("Resolve festival error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  login,
  logout,
  refresh,
  resolveActiveFestival,
};
