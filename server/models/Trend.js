const mongoose = require('mongoose');

const trendSchema = new mongoose.Schema({
  trend_name: { type: String, required: true },
  top_keywords: [{ type: String }],
  sentiment: { type: String, enum: ['Positive', 'Neutral', 'Negative'] },
  volume: { type: Number },
  // top_hashtags: [{ type: String }],
  Top_Hastags: [{ type: String }]
}, { timestamps: true });

// 👇 Force model to use the "current_trend" collection
module.exports = mongoose.model('Trend', trendSchema);
