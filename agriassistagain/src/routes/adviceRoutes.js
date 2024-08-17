// src/routes/adviceRoutes.js

const express = require('express');
const router = express.Router();
const { generateText } = require('../services/llamaAIService');

// Get farming advice
router.post('/get-advice', async (req, res) => {
  const { type, name, currentMethods, issues } = req.body;

  const prompt = `
    Provide detailed advice for the following:
    Type: ${type} (Crop/Animal)
    Name: ${name}
    Current Methods Used: ${currentMethods}
    Issues/Challenges: ${issues}

    The advice should be suitable for Malawi and should include:
    - Identification of possible causes
    - Step-by-step instructions to address the issues
    - Recommendations for improving overall health and yield
    -Any extra link for more info if needed
    
  `;

  try {
    const advice = await generateText(prompt);
    res.json({ advice });
  } catch (error) {
    res.status(500).json({ error: 'Error generating advice.' });
  }
});

module.exports = router;
