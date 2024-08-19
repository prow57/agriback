// src/routes/courseRoutes.js

const express = require('express');
const router = express.Router();
const { generateText } = require('../services/llamaAIService');
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
    const title = titleResult.trim(); // Assume the title is the whole output

    // Step 2: Generate the description based on the title
    const descriptionPrompt = `Write a brief introduction to the topic: "${title}" in summary in agriculture.`;
    const descriptionResult = await generateText(descriptionPrompt);
    const description = descriptionResult.trim(); // Assume the description is the whole output

    // Step 3: Save the generated title and description to the database
    try {
      const docRef = await db.collection('topics').add({
        category,
        title,
        description,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Return the generated title, description, and the document ID
      res.json({ title, description, id: docRef.id });
    } catch (dbError) {
      console.error('Error saving course topic and description:', dbError);
      res.status(500).json({ error: 'Error saving course topic and description to the database.' });
    }
  } catch (error) {
    console.error('Error generating course topic and description:', error);
    res.status(500).json({ error: 'Error generating course topic and description.' });
  }
});

// Get a list of all topics from the database
router.get('/topics', async (req, res) => {
  try {
    const coursesSnapshot = await db.collection('topics').get();
    const courses = [];
    coursesSnapshot.forEach(doc => {
      courses.push({ id: doc.id, ...doc.data() });
    });
    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Error fetching courses.' });
  }
});

// Get 5 random topics from the database
router.get('/random-topics', async (req, res) => {
  try {
    const coursesSnapshot = await db.collection('topics').get();
    const courses = [];

    // Extract data from Firestore snapshot
    coursesSnapshot.forEach(doc => {
      courses.push({ id: doc.id, ...doc.data() });
    });

    // Shuffle the array to randomize the order
    const shuffledCourses = courses.sort(() => 0.5 - Math.random());

    // Get the first 5 items from the shuffled array
    const selectedCourses = shuffledCourses.slice(0, 5);

    res.json(selectedCourses);
  } catch (error) {
    console.error('Error fetching random courses:', error);
    res.status(500).json({ error: 'Error fetching random courses.' });
  }
});

// Generate full course content based on the course ID and save it
// Generate full course content based on the course ID and save it
router.post('/generate-full-course/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const topicDoc = await db.collection('topics').doc(id).get();

    if (!topicDoc.exists) {
      return res.status(404).json({ error: 'Topic not found.' });
    }

    const topicData = topicDoc.data();
    const { title, description, category } = topicData;

    const prompt = `
      Generate a detailed lesson for the following:
      Category: ${category}
      Title: ${title}
      Description: ${description}
      
      The lesson should include:
      - Objectives
      - Introduction
      - Content with well-outlined sections and easy-to-understand explanations with examples
      - For practical lessons, specify all tools needed and include descriptions
      - Conclusion
      - References which must include links.
    `;

    const aiResponse = await generateText(prompt);

    // Assume aiResponse is a plain text block, and pass it to parseContentToJSON
    const structuredContent = parseContentToJSON(aiResponse);

    // Save the generated content to Firestore
    try {
      const docRef = await db.collection('courses').add({
        category,
        title,
        description,
        content: structuredContent,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Return the structured JSON response
      res.json({
        id: docRef.id,
        category,
        title,
        description,
        content: structuredContent,
      });

    } catch (dbError) {
      console.error('Error saving full course content:', dbError);
      res.status(500).json({ error: 'Error saving full course content to the database.' });
    }

  } catch (error) {
    res.status(500).json({ error: 'Error generating full course content.' });
  }
});

// Helper function to parse AI-generated text into structured JSON
function parseContentToJSON(aiResponse) {
  return {
    lesson_title: extractSection(aiResponse, 'Title'),
    objectives: extractSection(aiResponse, 'Objectives'),
    introduction: extractSection(aiResponse, 'Introduction'),
    sections: extractMultipleSections(aiResponse, 'Section'),
    practical_lessons: extractMultipleSections(aiResponse, 'Practical Lesson'),
    conclusion: extractSection(aiResponse, 'Conclusion'),
    references: extractReferences(aiResponse),
  };
}

// Extraction functions to parse sections from AI response
function extractSection(content, sectionTitle) {
  const regex = new RegExp(`\\b${sectionTitle}:\\b([\\s\\S]*?)(?=\\n\\n|\\b[A-Z][a-z]+:|$)`, 'i');
  const match = content.match(regex);
  return match ? match[1].trim() : '';
}

function extractMultipleSections(content, sectionTitle) {
  const regex = new RegExp(`\\b${sectionTitle} (\\d+):\\b([\\s\\S]*?)(?=\\n\\n|\\b[A-Z][a-z]+:|$)`, 'g');
  const matches = [...content.matchAll(regex)];
  return matches.map(match => ({
    title: `${sectionTitle} ${match[1]}`,
    content: match[2].trim(),
  }));
}

function extractReferences(content) {
  const regex = /References:\n([\s\S]*?)(?=\n\n|$)/i;
  const match = content.match(regex);
  if (match) {
    const refs = match[1].trim().split('\n').filter(ref => ref);
    return refs.map(ref => {
      const [title, link] = ref.split(' - ');
      return { title: title.trim(), link: link.trim() };
    });
  }
  return [];
}

      
      
// Get all courses from Firestore
router.get('/courses', async (req, res) => {
  try {
    const coursesSnapshot = await db.collection('courses').get();
    const courses = [];
    coursesSnapshot.forEach(doc => {
      courses.push({ id: doc.id, ...doc.data() });
    });
    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Error fetching courses.' });
  }
});

// Save course to Firestore
router.post('/save-course', async (req, res) => {
  const { category, title, description, content } = req.body;

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
    console.error('Error saving course:', error);
    res.status(500).json({ error: 'Error saving course.' });
  }
});

module.exports = router;
