//src/routes/personalRoutes.js
const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();


// Modify the course generation route to include user preferences
router.post('/generate-personalized-course', async (req, res) => {
  const { phone } = req.body;

  try {
    // Fetch user preferences from Firestore
    const userDoc = await db.collection('users').doc(phone).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const userData = userDoc.data();
    const { farming_type, interests } = userData;

    // Use AI to generate courses based on preferences
    const titlePrompt = `Generate a course title for ${farming_type} focusing on ${interests.join(", ")}.`;
    const title = (await generateText(titlePrompt)).trim();

    const descriptionPrompt = `Write a brief description for the course titled "${title}". The course should focus on ${farming_type} and ${interests.join(", ")}.`;
    const description = (await generateText(descriptionPrompt)).trim();

    // Save the generated course
    const docRef = await db.collection('topics').add({
      title,
      description,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ title, description, id: docRef.id });
  } catch (error) {
    console.error('Error generating personalized course:', error);
    res.status(500).json({ error: 'Error generating personalized course.' });
  }
});
