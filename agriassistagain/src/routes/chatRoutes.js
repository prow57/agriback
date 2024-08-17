// src/routes/chatRoutes.js

const express = require('express');
const router = express.Router();
const { generateText } = require('../services/llamaAIService');

// Chatbot endpoint
router.post('/chatbot', async (req, res) => {
  const { message } = req.body;

  const prompt = `
    You are an expert in agriculture named Agriassistai. Answer the following question in a detailed and informative manner:

    Question: ${message}
  `;

  try {
    const response = await generateText(prompt);
    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: 'Error generating Agriassistai response.' });
  }
});

module.exports = router;
