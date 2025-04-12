require("dotenv").config(); // Load environment variables
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const bodyParser = require("body-parser");

const trendRoutes = require("./routes/trendRoutes"); // ⬅️ Import trend routes
const futuretrendsRoutes = require("./routes/futuretrendsRoutes"); // ⬅️ Import future trends routes

const app = express();

// Middleware
app.use(express.json()); // Parse JSON requests
app.use(cors()); // Enable CORS for frontend requests
app.use(morgan("dev")); // Log API requests
app.use(bodyParser.json()); // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded requests

// // MongoDB Connection
// mongoose
//   .connect(process.env.MONGO_URI, {
//   })
//   .then(() => console.log("✅ MongoDB atlas Connected Successfully!"))
//   .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// MongoDB Connection
const MONGODB_URI = 'mongodb+srv://DhairyaVaghela:xYQtoQ1yaYTiBJO2@ai-powered-trend-cluste.ja1xbvz.mongodb.net/trendspotter?retryWrites=true&w=majority&appName=AI-Powered-Cluster';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// Routes
app.use("/api/trends", trendRoutes); // ⬅️ Mount trend API routes
app.use("/api/futuretrends",futuretrendsRoutes ); // ⬅️ Mount trend API routes
// Default Route
app.get("/", (req, res) => {
  res.send("Welcome to AI-Powered Trend Spotter API! 🚀");
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
