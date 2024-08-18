// src/services/llamaAIService.js

const axios = require('axios');
require('dotenv').config();

const LLAMA_AI_API_KEY = process.env.LLAMA_AI_API_KEY;
const LLAMA_AI_API_URL = process.env.LLAMA_AI_API_URL;

const axiosInstance = axios.create({
  baseURL: LLAMA_AI_API_URL,
  headers: {
    'Authorization': `Bearer ${LLAMA_AI_API_KEY}`,
    'Content-Type': 'application/json',
  },
});

const generateText = async (prompt) => {
  try {
    const response = await axiosInstance.post('/generate-text', {
      prompt,
      max_tokens: 1500,
    });
    return response.data.text;
  } catch (error) {
    console.error('Error generating text:', error.response.data);
    throw error;
  }
};

const generateImage = async (description) => {
  try {
    const response = await axiosInstance.post('/generate-image', {
      description,
    });
    return response.data.image_url;
  } catch (error) {
    console.error('Error generating image:', error.response.data);
    throw error;
  }
};

module.exports = {
  generateText,
  generateImage,
};
