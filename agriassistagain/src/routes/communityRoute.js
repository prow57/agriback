// communityRoute.js

const express = require('express');
const router = express.Router();
const { generateText } = require('../services/llamaAIService');

// AI content generation function using llamaAIService
async function generateAIContent(topic) {
  try {
    const prompt = `Generate detailed content about ${topic} in the context of agriculture.`;
    const aiContent = await generateText(prompt);

    // Simulated structured response
    return {
      title: topic,
      introduction: `This section covers essential details about ${topic}.`,
      sections: [
        {
          heading: `${topic} Overview`,
          content: aiContent, // Use the AI-generated content here
        },
        {
          heading: `Best Practices for ${topic}`,
          content: `A breakdown of best practices and tips related to ${topic}.`,
        },
        {
          heading: `${topic} Benefits`,
          content: `Detailed benefits of implementing modern ${topic}.`,
        },
      ],
      conclusion: `In conclusion, ${topic} is crucial for successful and sustainable agriculture practices.`,
    };
  } catch (error) {
    console.error('Error generating AI content:', error);
    return { error: 'Error generating content.' };
  }
}

// Endpoints for individual topics
router.get('/irrigation', async (req, res) => {
  const content = await generateAIContent('Irrigation Techniques');
  res.json(content);
});

router.get('/soil-management', async (req, res) => {
  const content = await generateAIContent('Soil Management');
  res.json(content);
});

router.get('/pest-control', async (req, res) => {
  const content = await generateAIContent('Pest Control');
  res.json(content);
});

router.get('/harvesting-tips', async (req, res) => {
  const content = await generateAIContent('Harvesting Tips');
  res.json(content);
});

router.get('/agri-tech', async (req, res) => {
  const content = await generateAIContent('Agricultural Technology');
  res.json(content);
});

module.exports = router;
