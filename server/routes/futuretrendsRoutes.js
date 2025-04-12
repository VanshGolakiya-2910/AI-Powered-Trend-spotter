const express = require('express');
const router = express.Router();
const predictionController = require('../controllers/predictionController');

// Specific static routes FIRST
router.get('/search', predictionController.searchFutureTrendsByKeyword);

// General routes
router.get('/', predictionController.getAllFutureTrends);
router.get('/:id', predictionController.getFutureTrendById);

module.exports = router;
