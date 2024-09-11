const express = require('express');
const router = express.Router();
const axios = require('axios');
const { generateAIContent} = require('../services/llamaAIService');

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
