// models/Prediction.js

const mongoose = require("mongoose");

const predictionSchema = new mongoose.Schema({
  trend_name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    required: true, // must be manually set to prediction time
  },
});

module.exports = mongoose.model("Prediction", predictionSchema , "Future_Trends");
