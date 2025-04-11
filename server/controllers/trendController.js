const Trend = require('../models/trend');
const mongoose = require('mongoose');

const STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
};

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);
exports.getAllTrends = async (req, res) => {
  try {
    const trends = await Trend.find().sort({ volume: -1 });
    return res.status(STATUS.OK).json(trends);
  } catch (err) {
    return res.status(STATUS.SERVER_ERROR).json({ error: err.message });
  }
};

//  GET trend by ID
exports.getTrendById = async (req, res) => {
  const { id } = req.params;

  if (!isValidId(id)) {
    return res.status(STATUS.BAD_REQUEST).json({ error: 'Invalid Trend ID' });
  }

  try {
    const trend = await Trend.findById(id);
    if (!trend) {
      return res.status(STATUS.NOT_FOUND).json({ error: 'Trend not found' });
    }
    return res.status(STATUS.OK).json(trend);
  } catch (err) {
    return res.status(STATUS.SERVER_ERROR).json({ error: err.message });
  }
};

// POST new trend
exports.createTrend = async (req, res) => {
  try {
    const newTrend = new Trend(req.body);
    const savedTrend = await newTrend.save();
    return res.status(STATUS.CREATED).json(savedTrend);
  } catch (err) {
    return res.status(STATUS.BAD_REQUEST).json({ error: err.message });
  }
};

// DELETE trend by ID
exports.deleteTrend = async (req, res) => {
  const { id } = req.params;

  if (!isValidId(id)) {
    return res.status(STATUS.BAD_REQUEST).json({ error: 'Invalid Trend ID' });
  }

  try {
    const result = await Trend.findByIdAndDelete(id);
    if (!result) {
      return res.status(STATUS.NOT_FOUND).json({ error: 'Trend not found' });
    }
    return res.status(STATUS.OK).json({ message: 'Trend deleted successfully' });
  } catch (err) {
    return res.status(STATUS.SERVER_ERROR).json({ error: err.message });
  }
};

// PUT (Update) trend by ID
exports.updateTrend = async (req, res) => {
  const { id } = req.params;

  if (!isValidId(id)) {
    return res.status(STATUS.BAD_REQUEST).json({ error: 'Invalid Trend ID' });
  }

  try {
    const updatedTrend = await Trend.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedTrend) {
      return res.status(STATUS.NOT_FOUND).json({ error: 'Trend not found' });
    }
    return res.status(STATUS.OK).json(updatedTrend);
  } catch (err) {
    return res.status(STATUS.BAD_REQUEST).json({ error: err.message });
  }
};

// GET trends by sentiment (Positive, Negative, Neutral)
exports.getTrendsBySentiment = async (req, res) => {
  const sentiment = req.params.sentiment;

  if (!["Positive", "Negative", "Neutral"].includes(sentiment)) {
    return res.status(STATUS.BAD_REQUEST).json({ error: 'Invalid sentiment value' });
  }

  try {
    const trends = await Trend.find({ sentiment });
    return res.status(STATUS.OK).json(trends);
  } catch (err) {
    return res.status(STATUS.SERVER_ERROR).json({ error: err.message });
  }
};

// GET top N trends by volume
exports.getTopTrendsByVolume = async (req, res) => {
  const count = parseInt(req.params.count);

  if (isNaN(count) || count <= 0) {
    return res.status(STATUS.BAD_REQUEST).json({ error: 'Invalid count value' });
  }

  try {
    const trends = await Trend.find().sort({ volume: -1 }).limit(count);
    return res.status(STATUS.OK).json(trends);
  } catch (err) {
    return res.status(STATUS.SERVER_ERROR).json({ error: err.message });
  }
};

// SEARCH trends by keyword (in trend_name or top_keywords)
exports.searchTrendsByKeyword = async (req, res) => {
  const keyword = req.query.keyword;

  if (!keyword || typeof keyword !== 'string') {
    return res.status(STATUS.BAD_REQUEST).json({ error: 'Keyword is required for search' });
  }

  try {
    const trends = await Trend.find({
      $or: [
        { trend_name: { $regex: keyword, $options: 'i' } },
        { top_keywords: { $elemMatch: { $regex: keyword, $options: 'i' } } }
      ]
    });
    return res.status(STATUS.OK).json(trends);
  } catch (err) {
    return res.status(STATUS.SERVER_ERROR).json({ error: err.message });
  }
};

// DELETE trend by ID
exports.deleteTrend = async (req, res) => {
  const { id } = req.params;

  if (!isValidId(id)) {
    return res.status(STATUS.BAD_REQUEST).json({ error: 'Invalid Trend ID' });
  }

  try {
    const result = await Trend.findByIdAndDelete(id);
    if (!result) {
      return res.status(STATUS.NOT_FOUND).json({ error: 'Trend not found' });
    }
    return res.status(STATUS.OK).json({ message: 'Trend deleted successfully' });
  } catch (err) {
    return res.status(STATUS.SERVER_ERROR).json({ error: err.message });
  }
};