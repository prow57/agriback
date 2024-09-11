const express = require('express');
const router = express.Router();
const axios = require('axios');
const { generateText } = require('./llamaAIService'); // Import the generateText method

// Weather API configuration
const WEATHER_API_KEY = process.env.WEATHER_API_KEY; // Your Weather API key
const WEATHER_API_URL = 'http://api.weatherapi.com/v1/current.json';

// POST endpoint for recommendations based on provided weather data
router.post('/recommendations', async (req, res) => {
  try {
    const { location } = req.body; // Expecting location to be provided in the request body

    // Fetch the weather data
    const weatherResponse = await axios.get(`${WEATHER_API_URL}?key=${WEATHER_API_KEY}&q=${location}`);
    const weatherData = weatherResponse.data;

    // Extract relevant weather information
    const condition = weatherData.current.condition.text;
    const temperature = weatherData.current.temp_c;

    // Create a prompt based on the weather information
    const prompt = `Provide farming recommendations based on the current weather in ${location}. The weather condition is ${condition} with a temperature of ${temperature}°C.`;

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
