// src/routes/courseRoutes.js

const express = require('express');
const router = express.Router();
const { generateText, generateImage } = require('../services/llamaAIService');
const admin = require('firebase-admin');

const db = admin.firestore();

// Generate course topic and description
router.post('/generate-course-topic', async (req, res) => {
  const { category } = req.body;

  // Step 1: Generate the lesson title based on the category
  const titlePrompt = `Generate a topic for a lesson in the category: ${category} in agriculture. Just provide the title, don't say anything more.`;

  try {
    // Generate the title
    const titleResult = await generateText(titlePrompt);
    const title = titleResult.trim();  // Assume the title is the whole output

    // Step 2: Generate the description based on the title
    const descriptionPrompt = `Write a brief introduction to the topic: "${title}". Summarize what the topic is about in agriculture.`;

    const descriptionResult = await generateText(descriptionPrompt);
    const description = descriptionResult.trim();  // Assume the description is the whole output

    // Return the generated title and description
    res.json({ title, description });

  } catch (error) {
    res.status(500).json({ error: 'Error generating course topic and description.' });
  }
});

// Generate full course content
router.post('/generate-full-course', async (req, res) => {
  const { title, description, category } = req.body;

  const prompt = `
    Generate a detailed lesson for the following:
    Category: ${category}
    Title: ${title}
    Description: ${description}
    
    The lesson should be include:
    - Objectives
    - Introduction
    - Content with well-outlined sections and easy-to-understand explanations with examples
    - For practical lessons, specify all tools needed and include descriptions
    - Conclusion
    - References which must include links.
  `;

  try {
    const content = await generateText(prompt);

    // If practical lessons are included, generate images
    //let images = [];
   // if (content.toLowerCase().includes('tools needed')) {
     // const imageDescription = `Tools needed for ${title} in ${category}`;
      //const imageUrl = await generateImage(imageDescription);
      //images.push(imageUrl);
    //}

    res.json({ title, description, content });
  } catch (error) {
    res.status(500).json({ error: 'Error generating full course content.' });
  }
});

// Save course to Firestore
router.post('/save-course', async (req, res) => {
  const { category, title, description, content} = req.body;

  try {
    const docRef = await db.collection('courses').add({
      category,
      title,
      description,
      content,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    res.json({ message: 'Course saved successfully.', id: docRef.id });
  } catch (error) {
    res.status(500).json({ error: 'Error saving course.' });
  }
});

module.exports = router;
