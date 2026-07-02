const express = require("express");
const app = express();
const mongoose = require("mongoose");
const morgan = require("morgan");
const envConfig = require("dotenv").config();
const cors = require("cors");
const PORT = envConfig.parsed?.PORT || process.env.PORT || 5001;


const programRoutes = require("./router/Router.js"); // adjust path
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");

const User = require("./models/User");

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", async () => {
  console.log("Connected to MongoDB");
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      const defaultAdmin = new User({
        username: "admin",
        email: "admin@sahityotsav.com",
        password: "admin123",
        role: "admin",
        status: "active"
      });
      await defaultAdmin.save();
      console.log("-----------------------------------------");
      console.log("No users found. Default Admin account seeded successfully:");
      console.log("Username: admin");
      console.log("Password: admin123");
      console.log("-----------------------------------------");
    }

    const Festival = require("./models/Festival");
    const festivalCount = await Festival.countDocuments();
    if (festivalCount === 0) {
      const defaultFestival = new Festival({
        name: "Sahityotsav",
        status: "active"
      });
      await defaultFestival.save();
      console.log("-----------------------------------------");
      console.log("No festivals found. Default active festival seeded successfully:");
      console.log("Name: Sahityotsav");
      console.log("-----------------------------------------");
    }
  } catch (err) {
    console.error("Error seeding default configurations:", err);
  }
});

// Middleware configuration
app.use(helmet({ contentSecurityPolicy: false })); // Apply basic security headers
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(cookieParser()); // Parse cookies
app.use(express.json());
app.use(morgan("dev"));

app.use(express.urlencoded({ extended: true }));


app.use(cors({
  origin: function (origin, callback) {
    // In single-tenant mode, allow any origin
    return callback(null, true);
  },
  credentials: true
}));

app.get("/test", (req, res) => {
  res.json({
    message: "GET API is working!",
  });
});

app.use("/api", programRoutes);

app.use((err, req, res, next) => {
  console.error("Global Error Handler:", JSON.stringify(err, Object.getOwnPropertyNames(err)));
  res.status(500).json({ success: false, error: err.message || err });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
0;
