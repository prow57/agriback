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
    res.status(500).json({ error: 'Error generating course topic and description.' });
  }
});

// Get a list of all topics from database

router.get('/topics', async (req, res) => {
  try {
    const coursesSnapshot = await db.collection('topics').get();
    const courses = [];
    coursesSnapshot.forEach(doc => {
      courses.push({ id: doc.id, ...doc.data() });
    });
    res.json(courses);
  } catch (error) {
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
    res.status(500).json({ error: 'Error fetching random courses.' });
  }
});


// Generate full course content based on the course ID and save it
router.post('/generate-full-course/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const courseDoc = await db.collection('topics').doc(id).get();

    if (!courseDoc.exists) {
      return res.status(404).json({ error: 'Course not found.' });
    }

    const courseData = courseDoc.data();
    const { title, description, category } = courseData;

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

    const content = await generateText(prompt);

    // Optionally save the generated content
    try {
      const docRef = await db.collection('courses').add({
        title,
        content,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    
      
      // Return the generated title, description, and the document ID
    

      res.json({ category, title, description, content, id: docRef.id});

  } catch (error) {
    res.status(500).json({ error: 'Error generating full course content.' });
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

// src/routes/courseRoutes.js
router.get('/courses', async (req, res) => {
  try {
    const coursesSnapshot = await db.collection('courses').get();
    const courses = [];
    coursesSnapshot.forEach(doc => {
      courses.push({ id: doc.id, ...doc.data() });
    });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching courses.' });
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
