const express = require('express');
const router = express.Router();
const trendController = require('../controllers/trendController');

// Specific static routes FIRST
router.get('/search', trendController.searchTrendsByKeyword);
router.get('/sentiment/:sentiment', trendController.getTrendsBySentiment);
router.get('/top/:count', trendController.getTopTrendsByVolume);

// General routes
router.get('/', trendController.getAllTrends);
router.post('/', trendController.createTrend);
router.get('/:id', trendController.getTrendById);
router.put('/:id', trendController.updateTrend);
router.delete('/:id', trendController.deleteTrend);

// delete trend by ID
router.delete('/delete/:id', trendController.deleteTrend);
module.exports = router;
