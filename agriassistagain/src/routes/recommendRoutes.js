const express = require('express');
const router = express.Router();
const axios = require('axios');
const { generateText } = require('../services/llamaAIService');

// Weather API configuration
const WEATHER_API_KEY = process.env.WEATHER_API_KEY; // Your Weather API key
const WEATHER_API_URL = 'http://api.weatherapi.com/v1/forecast.json';

// POST endpoint for recommendations based on provided weather data
router.post('/recommend-weather', async (req, res) => {
  try {
    const { location, days = 7 } = req.body; // Expecting location and optionally days to be provided in the request body

    // Fetch the weather forecast data
    const weatherResponse = await axios.get(`${WEATHER_API_URL}?key=${WEATHER_API_KEY}&q=${location}&days=${days}`);
    const weatherData = weatherResponse.data;

    // Extract relevant weather information
    // Example: Get the forecast for the first day
    const forecastDay = weatherData.forecast.forecastday[0]; // Adjust index if you want different days
    const condition = forecastDay.day.condition.text;
    const temperature = forecastDay.day.avgtemp_c;

    // Create a prompt based on the weather information
    const prompt = `Provide a short farm activity for today based on the weather forecast for ${location}. The forecast for today is ${condition} with an average temperature of ${temperature}°C.`;

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
