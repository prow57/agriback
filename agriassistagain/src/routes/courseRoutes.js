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

    // Generate each part separately
    const objectivesPrompt = `Write the objectives for a lesson on the topic "${title}" in the category "${category}".`;
    const introductionPrompt = `Write an introduction for a lesson on the topic "${title}" in the category "${category}".`;
    const contentPrompt = `Write the detailed content for a lesson on the topic "${title}" in the category "${category}". Include well-outlined sections with easy-to-understand explanations and examples.`;
    const practicalPrompt = `Describe the practical lessons, including the tools needed and their descriptions, for a lesson on the topic "${title}" in the category "${category}".`;
    const conclusionPrompt = `Write a conclusion for a lesson on the topic "${title}" in the category "${category}".`;
    const referencesPrompt = `Provide references for a lesson on the topic "${title}" in the category "${category}". Include links where available.`;

    const objectives = (await generateText(objectivesPrompt)).trim();
    const introduction = (await generateText(introductionPrompt)).trim();
    const content = (await generateText(contentPrompt)).trim();
    const practicalLessons = (await generateText(practicalPrompt)).trim();
    const conclusion = (await generateText(conclusionPrompt)).trim();
    const references = (await generateText(referencesPrompt)).trim();

    // Structure the content into JSON format
    const structuredContent = {
      lesson_title: title,
      objectives: objectives,
      introduction: introduction,
      sections: content.split('\n\n').map((section, index) => ({
        title: `Section ${index + 1}`,
        content: section.trim(),
      })),
      practical_lessons: practicalLessons.split('\n\n').map((lesson, index) => ({
        title: `Practical Lesson ${index + 1}`,
        content: lesson.trim(),
      })),
      conclusion: conclusion,
      references: references.split('\n').map((ref, index) => ({
        title: `Reference ${index + 1}`,
        link: ref.trim(),
      })),
    };

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
    console.error('Error generating full course content:', error);
    res.status(500).json({ error: 'Error generating full course content.' });
  }
});


// Generate full course content based on the course ID and save it
router.post('/generate-full-course', async (req, res) => {
  const { title, description, category } = req.body;

  try {

    // Generate each part separately
    const objectivesPrompt = `Write the objectives for a lesson on the topic "${title}" in the category "${category}".`;
    const introductionPrompt = `Write an introduction for a lesson on the topic "${title}" in the category "${category}".`;
    const contentPrompt = `Write the detailed content for a lesson on the topic "${title}" in the category "${category}". Include well-outlined sections with easy-to-understand explanations and examples.`;
    const practicalPrompt = `Describe the practical lessons, including the tools needed and their descriptions, for a lesson on the topic "${title}" in the category "${category}".`;
    const conclusionPrompt = `Write a conclusion for a lesson on the topic "${title}" in the category "${category}".`;
    const referencesPrompt = `Provide references for a lesson on the topic "${title}" in the category "${category}". Include links where available.`;

    const objectives = (await generateText(objectivesPrompt)).trim();
    const introduction = (await generateText(introductionPrompt)).trim();
    const content = (await generateText(contentPrompt)).trim();
    const practicalLessons = (await generateText(practicalPrompt)).trim();
    const conclusion = (await generateText(conclusionPrompt)).trim();
    const references = (await generateText(referencesPrompt)).trim();

    // Structure the content into JSON format
    const structuredContent = {
      lesson_title: title,
      objectives: objectives,
      introduction: introduction,
      sections: content.split('\n\n').map((section, index) => ({
        title: `Section ${index + 1}`,
        content: section.trim(),
      })),
      practical_lessons: practicalLessons.split('\n\n').map((lesson, index) => ({
        title: `Practical Lesson ${index + 1}`,
        content: lesson.trim(),
      })),
      conclusion: conclusion,
      references: references.split('\n').map((ref, index) => ({
        title: `Reference ${index + 1}`,
        link: ref.trim(),
      })),
    };

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
    console.error('Error generating full course content:', error);
    res.status(500).json({ error: 'Error generating full course content.' });
  }
});
      
      
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
//Get course by course id
router.get('/get-course/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const courseDoc = await db.collection('courses').doc(id).get();
    if (!courseDoc.exists) {
      return res.status(404).json({ error: 'Course not found.' });
    }
    res.json({ id: courseDoc.id, ...courseDoc.data() });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching course.' });
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
