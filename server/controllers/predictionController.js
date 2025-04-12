const Trend = require('../models/FutureTrends');
const mongoose = require('mongoose');

const STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
};

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);
exports.getAllFutureTrends = async (req, res) => {
  try {
    const trends = await Trend.find().sort({ volume: -1 });
    return res.status(STATUS.OK).json(trends);
  } catch (err) {
    return res.status(STATUS.SERVER_ERROR).json({ error: err.message });
  }
};

//  GET trend by ID
exports.getFutureTrendById = async (req, res) => {
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

// SEARCH trends by keyword (in trend_name or top_keywords)
exports.searchFutureTrendsByKeyword = async (req, res) => {
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

