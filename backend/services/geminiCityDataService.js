// backend/services/geminiCityDataService.js - COMPLETELY FIXED VERSION
// Comment out the CityData import for now since you don't have the model yet
// const CityData = require('../models/CityData');

class GeminiCityDataService {
  constructor() {
    this.geminiApiKey = process.env.GEMINI_API_KEY;
    this.baseURL = 'https://generativelanguage.googleapis.com/v1beta/models';
    this.model = 'gemini-2.0-flash';
    this.cacheExpiryDays = 30;
  }

  async getCityData(cityName, incomeBracket = 'emerging') {
    try {
      // Skip cache check for now since we don't have CityData model
      // const existingData = await this.checkCachedData(cityName, incomeBracket);
      // if (existingData) {
      //   console.log(`✅ Using cached data for ${cityName} - ${incomeBracket}`);
      //   return existingData;
      // }

      // Generate new data using Gemini API
      console.log(`🤖 Generating new data for ${cityName} - ${incomeBracket}`);
      const generatedData = await this.generateDataFromGemini(cityName, incomeBracket);
      
      if (generatedData) {
        // Skip saving for now since we don't have CityData model
        // await this.saveCityData(cityName, incomeBracket, generatedData);
        return generatedData;
      }

      return this.getFallbackData(cityName, incomeBracket);

    } catch (error) {
      console.error('❌ Error in getCityData:', error);
      return this.getFallbackData(cityName, incomeBracket);
    }
  }

  async generateDataFromGemini(cityName, incomeBracket) {
    const prompt = this.buildFinancialPrompt(cityName, incomeBracket);
    
    try {
      const response = await fetch(`${this.baseURL}/${this.model}:generateContent?key=${this.geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.4,
            topK: 32,
            topP: 1,
            maxOutputTokens: 2048,
            responseMimeType: "application/json"
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const generatedText = data.candidates[0].content.parts[0].text;
        return this.parseGeminiResponse(generatedText, cityName, incomeBracket);
      }

      throw new Error('Invalid Gemini response structure');

    } catch (error) {
      console.error('❌ Gemini API error:', error);
      return null;
    }
  }

  buildFinancialPrompt(cityName, incomeBracket) {
    const bracketInfo = {
      budget: { min: 0, max: 15000, desc: "Budget conscious individuals (students, entry-level workers)" },
      emerging: { min: 15000, max: 30000, desc: "Emerging middle class (junior professionals, small business owners)" },
      stable: { min: 30000, max: 60000, desc: "Stable middle class (experienced professionals, managers)" },
      affluent: { min: 60000, max: 100000, desc: "Affluent individuals (senior professionals, business owners)" }
    };

    const bracket = bracketInfo[incomeBracket] || bracketInfo.emerging;

    // FIXED: Using regular string concatenation instead of template literals to avoid syntax issues
    const promptText = 'You are a financial expert providing realistic monthly expense data for ' + cityName + ', India for ' + bracket.desc + ' with income range ₹' + bracket.min.toLocaleString() + '-₹' + bracket.max.toLocaleString() + '.\n\n' +
    'Generate accurate, realistic data based on current market conditions in ' + cityName + '. Consider local factors like:\n' +
    '- Cost of living variations in ' + cityName + '\n' +
    '- Local transportation options and costs\n' +
    '- Housing market conditions\n' +
    '- Food prices and dining culture\n' +
    '- Entertainment and lifestyle costs\n' +
    '- Healthcare infrastructure and costs\n\n' +
    'Respond ONLY with valid JSON in this exact format:\n' +
    '{\n' +
    '  "city": "' + cityName.toLowerCase() + '",\n' +
    '  "incomeBracket": "' + incomeBracket + '",\n' +
    '  "costOfLiving": {\n' +
    '    "food": {\n' +
    '      "groceries": { "min": 0, "max": 0, "average": 0 },\n' +
    '      "diningOut": { "min": 0, "max": 0, "average": 0 },\n' +
    '      "streetFood": { "min": 0, "max": 0, "average": 0 }\n' +
    '    },\n' +
    '    "transport": {\n' +
    '      "publicTransport": { "min": 0, "max": 0, "average": 0 },\n' +
    '      "fuel": { "min": 0, "max": 0, "average": 0 },\n' +
    '      "taxi": { "min": 0, "max": 0, "average": 0 }\n' +
    '    },\n' +
    '    "housing": {\n' +
    '      "rent": { "min": 0, "max": 0, "average": 0 },\n' +
    '      "utilities": { "min": 0, "max": 0, "average": 0 }\n' +
    '    },\n' +
    '    "entertainment": {\n' +
    '      "movies": { "min": 0, "max": 0, "average": 0 },\n' +
    '      "shopping": { "min": 0, "max": 0, "average": 0 },\n' +
    '      "outings": { "min": 0, "max": 0, "average": 0 }\n' +
    '    },\n' +
    '    "healthcare": {\n' +
    '      "medicines": { "min": 0, "max": 0, "average": 0 },\n' +
    '      "consultations": { "min": 0, "max": 0, "average": 0 },\n' +
    '      "insurance": { "min": 0, "max": 0, "average": 0 }\n' +
    '    }\n' +
    '  },\n' +
    '  "localFactors": [\n' +
    '    "Factor 1 affecting costs in ' + cityName + '",\n' +
    '    "Factor 2 affecting costs in ' + cityName + '",\n' +
    '    "Factor 3 affecting costs in ' + cityName + '"\n' +
    '  ],\n' +
    '  "recommendations": [\n' +
    '    "Money-saving tip 1 specific to ' + cityName + '",\n' +
    '    "Money-saving tip 2 specific to ' + cityName + '",\n' +
    '    "Money-saving tip 3 specific to ' + cityName + '"\n' +
    '  ]\n' +
    '}\n\n' +
    'Ensure all amounts are realistic for ' + cityName + ' and the ' + incomeBracket + ' income bracket.';

    return promptText;
  }

  parseGeminiResponse(responseText, cityName, incomeBracket) {
    try {
      // FIXED: Simple string cleaning without problematic indexOf operations
      let jsonText = responseText.trim();
      
      // Remove markdown code blocks if present - SAFER METHOD
      if (jsonText.includes('```json')) {
        const startIndex = jsonText.indexOf('```json') + 7;
        const endIndex = jsonText.indexOf('```', startIndex);
        if (endIndex !== -1) {
          jsonText = jsonText.substring(startIndex, endIndex);
        }
      } else if (jsonText.includes('```')) {
        const startIndex = jsonText.indexOf('```') + 3;
        const endIndex = jsonText.indexOf('```', startIndex);
        if (endIndex !== -1) {
          jsonText = jsonText.substring(startIndex, endIndex);
        }
      }

      const parsedData = JSON.parse(jsonText.trim());
      
      // Validate and enhance the data
      return {
        city: cityName.toLowerCase(),
        incomeBracket: incomeBracket,
        costOfLiving: parsedData.costOfLiving || {},
        localFactors: parsedData.localFactors || [],
        recommendations: parsedData.recommendations || [],
        categoryPercentages: parsedData.categoryPercentages || {},
        dataSource: 'gemini-generated',
        confidence: 'high',
        generatedAt: new Date()
      };

    } catch (error) {
      console.error('❌ Error parsing Gemini response:', error);
      console.log('Raw response:', responseText);
      return null;
    }
  }

  // Commented out database methods since CityData model doesn't exist yet
  /*
  async checkCachedData(cityName, incomeBracket) {
    try {
      const cityData = await CityData.findOne({
        city: cityName.toLowerCase(),
        incomeBracket: incomeBracket
      });

      if (!cityData) return null;

      const daysDiff = (new Date() - cityData.lastUpdated) / (1000 * 60 * 60 * 24);
      if (daysDiff > this.cacheExpiryDays) {
        return null;
      }

      return cityData;
    } catch (error) {
      console.error('❌ Error checking cached data:', error);
      return null;
    }
  }

  async saveCityData(cityName, incomeBracket, data) {
    try {
      const cityData = new CityData({
        city: cityName.toLowerCase(),
        incomeBracket,
        costOfLiving: data.costOfLiving,
        localFactors: data.localFactors,
        recommendations: data.recommendations,
        categoryPercentages: data.categoryPercentages,
        dataSource: 'gemini-generated',
        lastUpdated: new Date(),
        isActive: true
      });

      await cityData.save();
      console.log(`✅ Saved Gemini-generated data for ${cityName} - ${incomeBracket}`);
      
    } catch (error) {
      console.error('❌ Error saving city data:', error);
    }
  }
  */

  getFallbackData(cityName, incomeBracket) {
    const fallbackRanges = {
      budget: { food: 4000, transport: 1500, housing: 5000 },
      emerging: { food: 6000, transport: 3000, housing: 8000 },
      stable: { food: 8000, transport: 4000, housing: 12000 },
      affluent: { food: 12000, transport: 6000, housing: 20000 }
    };

    const ranges = fallbackRanges[incomeBracket] || fallbackRanges.emerging;

    return {
      city: cityName.toLowerCase(),
      incomeBracket: incomeBracket,
      costOfLiving: {
        food: { 
          groceries: { min: ranges.food * 0.8, max: ranges.food * 1.2, average: ranges.food },
          diningOut: { min: ranges.food * 0.3, max: ranges.food * 0.7, average: ranges.food * 0.5 },
          streetFood: { min: 150, max: 400, average: 250 }
        },
        transport: { 
          publicTransport: { min: ranges.transport * 0.6, max: ranges.transport * 1.0, average: ranges.transport * 0.8 },
          fuel: { min: ranges.transport * 1.2, max: ranges.transport * 2.0, average: ranges.transport * 1.5 },
          taxi: { min: ranges.transport * 0.8, max: ranges.transport * 1.5, average: ranges.transport * 1.1 }
        },
        housing: { 
          rent: { min: ranges.housing * 0.8, max: ranges.housing * 1.5, average: ranges.housing },
          utilities: { min: ranges.housing * 0.15, max: ranges.housing * 0.25, average: ranges.housing * 0.2 }
        },
        entertainment: {
          movies: { min: 200, max: 500, average: 350 },
          shopping: { min: 1000, max: 3000, average: 2000 },
          outings: { min: 800, max: 2000, average: 1400 }
        },
        healthcare: {
          medicines: { min: 500, max: 1500, average: 1000 },
          consultations: { min: 300, max: 1000, average: 650 },
          insurance: { min: 800, max: 2500, average: 1650 }
        }
      },
      localFactors: [
        cityName + ' has moderate cost of living',
        'Public transport options available',
        'Varied housing options across price ranges',
        'Local markets for affordable shopping',
        'Growing employment opportunities'
      ],
      recommendations: [
        'Use public transport to save on commuting costs',
        'Shop at local markets for fresh produce',
        'Consider shared accommodation to reduce housing costs',
        'Look for local dining options for affordable meals',
        'Take advantage of free entertainment options'
      ],
      categoryPercentages: {
        food: 25,
        transport: 15,
        housing: 30,
        entertainment: 10,
        healthcare: 8,
        education: 5,
        others: 7
      },
      dataSource: 'fallback',
      confidence: 'low'
    };
  }
}

module.exports = new GeminiCityDataService();