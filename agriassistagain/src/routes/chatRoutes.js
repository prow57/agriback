// src/routes/chatRoutes.js

/**
 * @swagger
 * /api/chat/chat:
 *   post:
 *     summary: Interact with the Agriassist AI chatbot
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 description: The user's question for the chatbot
 *     responses:
 *       200:
 *         description: Agriassist-AI Chatbot response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 response:
 *                   type: string
 *                   description: AI-generated chatbot response
 *       500:
 *         description: Error generating Agriassistai response
 */


const express = require('express');
const router = express.Router();
const { generateText } = require('../services/llamaAIService');

// Chatbot endpoint
router.post('/chat', async (req, res) => {
  const { message } = req.body;

  const prompt = `
    You are an expert in agriculture named Agriassist-AI. Answer the following question in simple if its a simple question and detailed if the question is about specific agricultural area in a simplified manner:

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
