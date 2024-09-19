//recommendRoites.js

const express = require('express');
const router = express.Router();
const axios = require('axios');
const { generateText } = require('../services/llamaAIService');

// Weather API configuration
const WEATHER_API_KEY = process.env.WEATHER_API_KEY; // Your Weather API key
const WEATHER_API_URL = 'http://api.weatherapi.com/v1/forecast.json';

/**
 * @swagger
 * /weather:
 *   post:
 *     summary: Get weather-based recommendations for farmers
 *     description: Fetches weather data for a specific location and provides recommendations based on the forecast.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               location:
 *                 type: string
 *                 description: The location for which to get the weather forecast.
 *                 example: "Lilongwe"
 *               days:
 *                 type: integer
 *                 description: The number of days for the forecast (optional, default is 1).
 *                 example: 1
 *     responses:
 *       200:
 *         description: A successful response with recommendations based on the weather.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 recommendations:
 *                   type: string
 *                   description: Recommendations for farmers based on the weather forecast.
 *       500:
 *         description: An error occurred while fetching recommendations.
 */
router.post('/weather', async (req, res) => {
  try {
    const { location, days = 1 } = req.body;

    // Fetch the weather forecast data
    const weatherResponse = await axios.get(`${WEATHER_API_URL}?key=${WEATHER_API_KEY}&q=${location}&days=${days}`);
    const weatherData = weatherResponse.data;

    // Extract relevant weather information
    const forecastDay = weatherData.forecast.forecastday[0];
    const condition = forecastDay.day.condition.text;
    const temperature = forecastDay.day.avgtemp_c;

    // Create a prompt based on the weather information
    const prompt = `Provide a short recommendation for Malawian farmers today based on the weather forecast for ${location}. The forecast for today is ${condition} with an average temperature of ${temperature}°C.`;

    // Generate recommendations using the AI service
    const recommendations = await generateText(prompt);

    // Send the recommendations as a response
    res.json({ recommendations });
  } catch (error) {
    console.error('Error fetching weather or generating recommendations:', error);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

module.exports = router;
