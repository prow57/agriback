// src/routes/adviceRoutes.js

/**
 * @swagger
 * /api/advice/get-advice:
 *   post:
 *     summary: Get farming advice
 *     tags: [Advice]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 description: Type of farming (Crop/Animal)
 *               name:
 *                 type: string
 *                 description: Name of the crop or animal
 *               currentMethods:
 *                 type: string
 *                 description: Current farming methods being used
 *               issues:
 *                 type: string
 *                 description: Issues or challenges faced
 *     responses:
 *       200:
 *         description: Farming advice response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 advice:
 *                   type: string
 *                   description: AI-generated farming advice
 *       500:
 *         description: Error generating advice
 */

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
    - Any extra links for more info if needed
  `;

  try {
    const advice = await generateText(prompt);
    res.json({ advice });
  } catch (error) {
    res.status(500).json({ error: 'Error generating advice.' });
  }
});

module.exports = router;
