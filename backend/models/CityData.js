// backend/models/CityData.js - CREATE THIS FILE
const mongoose = require('mongoose');

const cityDataSchema = new mongoose.Schema({
  city: { 
    type: String, 
    required: true, 
    lowercase: true,
    index: true 
  },
  incomeBracket: { 
    type: String, 
    enum: ['budget', 'emerging', 'stable', 'affluent'],
    required: true,
    index: true
  },
  costOfLiving: {
    food: {
      groceries: { min: Number, max: Number, average: Number },
      diningOut: { min: Number, max: Number, average: Number },
      streetFood: { min: Number, max: Number, average: Number }
    },
    transport: {
      publicTransport: { min: Number, max: Number, average: Number },
      fuel: { min: Number, max: Number, average: Number },
      taxi: { min: Number, max: Number, average: Number }
    },
    housing: {
      rent: { min: Number, max: Number, average: Number },
      utilities: { min: Number, max: Number, average: Number }
    },
    entertainment: {
      movies: { min: Number, max: Number, average: Number },
      shopping: { min: Number, max: Number, average: Number },
      outings: { min: Number, max: Number, average: Number }
    },
    healthcare: {
      medicines: { min: Number, max: Number, average: Number },
      consultations: { min: Number, max: Number, average: Number },
      insurance: { min: Number, max: Number, average: Number }
    },
    education: {
      courses: { min: Number, max: Number, average: Number },
      books: { min: Number, max: Number, average: Number }
    },
    others: {
      personal: { min: Number, max: Number, average: Number },
      miscellaneous: { min: Number, max: Number, average: Number }
    }
  },
  localFactors: [String],
  recommendations: [String],
  categoryPercentages: {
    food: { type: Number, default: 25 },
    transport: { type: Number, default: 15 },
    housing: { type: Number, default: 30 },
    entertainment: { type: Number, default: 10 },
    healthcare: { type: Number, default: 8 },
    education: { type: Number, default: 5 },
    others: { type: Number, default: 7 }
  },
  dataSource: { 
    type: String, 
    enum: ['gemini-generated', 'manual', 'api', 'fallback'],
    default: 'gemini-generated' 
  },
  confidence: { 
    type: String, 
    enum: ['high', 'medium', 'low'],
    default: 'medium' 
  },
  lastUpdated: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Compound index for efficient queries
cityDataSchema.index({ city: 1, incomeBracket: 1 }, { unique: true });

module.exports = mongoose.model('CityData', cityDataSchema);
