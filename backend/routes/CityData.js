// backend/routes/cityData.js - CREATE THIS FILE
const express = require('express');
const authMiddleware = require('../middleware/auth');
const geminiCityDataService = require('../services/geminiCityDataService');
const router = express.Router();

router.get('/city-data/:city/:bracket', authMiddleware, async (req, res) => {
  try {
    const { city, bracket } = req.params;
    
    console.log(`🏙️ Fetching data for ${city} - ${bracket}`);
    
    const cityData = await geminiCityDataService.getCityData(city, bracket);
    
    if (cityData) {
      res.json({
        success: true,
        data: cityData
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'City data not available'
      });
    }
    
  } catch (error) {
    console.error('❌ Error in city data route:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;
