// src/routes/courseRoutes.js

const express = require('express');
const router = express.Router();
const { generateText } = require('../services/llamaAIService');
const { generateImage } = require('../services/imageService')
const admin = require('firebase-admin');

const db = admin.firestore();

// Generate course topic and description
router.post('/generate-course-topic', async (req, res) => {
  const { category } = req.body;

  // Step 1: Generate the lesson title based on the category
  const titlePrompt = `Generate a topic for a lesson in the category: ${category} in agriculture. Just provide the title, don't say anything more. Do not include your opening statement on the response.`;

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
    const objectivesPrompt = `Write the objectives for a lesson on the topic "${title}" in the category "${category}". Do not include your opening statement on the response..`;
    const introductionPrompt = `Write an introduction paragraph for a lesson on the topic "${title}" in the category "${category}". Make it short with less than 14 lines. Do not include your opening statement on the response.`;
    const contentPrompt = `Write the detailed content for a lesson on the topic "${title}" in the category "${category}". Include well-outlined sections with easy-to-understand explanations and examples. Preferably applicable in Malawi. Do not include your opening statement on the response.`;
    const practicalPrompt = `Describe the practical lessons, including the tools needed and their descriptions, for a lesson on the topic "${title}" in the category "${category}". Should be applicable in Malawi. Should be less than 8 lessons.`;
    const conclusionPrompt = `Write a conclusion for a lesson on the topic "${title}" in the category "${category}".`;
    const referencesPrompt = `Provide less than 6 references for a lesson on the topic "${title}" in the category "${category}". Include links where available.`;

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
  sections: content.split('\n\n').map(section => {
    const [firstLine, ...rest] = section.trim().split('\n');
    return {
      title: firstLine.trim(),
      content: rest.join('\n').trim(),
    };
  }),
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
    const objectivesPrompt = `Write the objectives for a lesson on the topic "${title}" in the category "${category}". Do not include your opening statement on the response..`;
    const introductionPrompt = `Write an introduction paragraph for a lesson on the topic "${title}" in the category "${category}". Make it short with less than 14 lines. Do not include your opening statement on the response.`;
    const contentPrompt = `Write the detailed content for a lesson on the topic "${title}" in the category "${category}". Include well-outlined sections with easy-to-understand explanations and examples. Preferably applicable in Malawi. Do not include your opening statement on the response.`;
    const practicalPrompt = `Describe the practical lessons, including the tools needed and their descriptions, for a lesson on the topic "${title}" in the category "${category}". Should be applicable in Malawi. Should be less than 8 lessons.`;
    const conclusionPrompt = `Write a conclusion for a lesson on the topic "${title}" in the category "${category}".`;
    const referencesPrompt = `Provide less than 6 references for a lesson on the topic "${title}" in the category "${category}". Include links where available.`;

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
  sections: content.split('\n\n').map(section => {
    const [firstLine, ...rest] = section.trim().split('\n');
    return {
      title: firstLine.trim(),
      content: rest.join('\n').trim(),
    };
  }),
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

//Generate full course content based on topic and category 
// Generate full course content based on topic and category 
router.post('/generate-exp', async (req, res) => {
  const { title, category } = req.body;

  try {

    // Generate each part separately
    const objectivesPrompt = `Write the objectives for a lesson on the topic "${title}" in the category "${category}". Provide them in a numbered list format.`;
    const introductionPrompt = `Write a concise introduction for a lesson on the topic "${title}" in the category "${category}". Ensure it is less than 14 lines and sets up the context for the rest of the lesson.`;
    const contentPrompt = `Write the detailed content for a lesson on the topic "${title}" in the category "${category}". Include well-outlined sections with easy-to-understand explanations, examples, and practical applications relevant to Malawi. Start each section with a title.`;
    const practicalPrompt = `Describe the practical lessons, including the tools needed and their descriptions, for a lesson on the topic "${title}" in the category "${category}". Should include fewer than 8 lessons and be applicable to Malawi. Each lesson should start with a title.`;
    const conclusionPrompt = `Write a conclusion for a lesson on the topic "${title}" in the category "${category}". Summarize the key points discussed in the lesson.`;
    const referencesPrompt = `Provide fewer than 6 references for a lesson on the topic "${title}" in the category "${category}". Include links where available. Use proper citation format.`;

    const descriptionPrompt = `Write a short, focused description of a lesson on the topic "${title}" within the "${category}" category. Ensure it is directly related to the context of Malawi.`;

    // Generate the content
    const objectives = (await generateText(objectivesPrompt)).trim();
    const introduction = (await generateText(introductionPrompt)).trim();
    const content = (await generateText(contentPrompt)).trim();
    const practicalLessons = (await generateText(practicalPrompt)).trim();
    const conclusion = (await generateText(conclusionPrompt)).trim();
    const references = (await generateText(referencesPrompt)).trim();
    const description = (await generateText(descriptionPrompt)).trim();

    // Structure the content into JSON format
    const structuredContent = {
      lesson_title: title,
      objectives: objectives,
      introduction: introduction,
      sections: content.split('\n\n').map(section => {
        const [firstLine, ...rest] = section.trim().split('\n');
        return {
          title: firstLine.trim(),
          content: rest.join('\n').trim(),
        };
      }),
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
      const docRef = await db.collection('explore').add({
        category,
        title,
        image: "image", // Placeholder for image URL
        description,
        content: structuredContent,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Return the structured JSON response
      res.json({
        id: docRef.id,
        category,
        title,
        image: "image", // Placeholder for image URL
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

// Import the generateImage function
// Update the path as needed

router.post('/generate-explore', async (req, res) => {
  const { title, category } = req.body;

  try {
    // Generate each part separately
    const objectivesPrompt = `Write the objectives for a lesson on the topic "${title}" in the category "${category}". Provide them in a numbered list format.`;
    const introductionPrompt = `Write a concise introduction for a lesson on the topic "${title}" in the category "${category}". Ensure it is less than 14 lines and sets up the context for the rest of the lesson.`;
    const contentPrompt = `Write the detailed content for a lesson on the topic "${title}" in the category "${category}". Include well-outlined sections with easy-to-understand explanations, examples, and practical applications relevant to Malawi. Start each section with a title.`;
    const practicalPrompt = `Describe the practical lessons, including the tools needed and their descriptions, for a lesson on the topic "${title}" in the category "${category}". Should include fewer than 8 lessons and be applicable to Malawi. Each lesson should start with a title.`;
    const conclusionPrompt = `Write a conclusion for a lesson on the topic "${title}" in the category "${category}". Summarize the key points discussed in the lesson.`;
    const referencesPrompt = `Provide fewer than 6 references for a lesson on the topic "${title}" in the category "${category}". Include links where available. Use proper citation format.`;
    const descriptionPrompt = `Write a short, focused description of a lesson on the topic "${title}" within the "${category}" category. Ensure it is directly related to the context of Malawi.`;

    // Generate the content
    const objectives = (await generateText(objectivesPrompt)).trim();
    const introduction = (await generateText(introductionPrompt)).trim();
    const content = (await generateText(contentPrompt)).trim();
    const practicalLessons = (await generateText(practicalPrompt)).trim();
    const conclusion = (await generateText(conclusionPrompt)).trim();
    const references = (await generateText(referencesPrompt)).trim();
    const description = (await generateText(descriptionPrompt)).trim();

    // Generate the image based on the title and category
    let imageUrl;
    try {
      imageUrl = await generateImage(`A visual representation of ${title} in the context of ${category}`);
    } catch (imageError) {
      console.error('Error generating image:', imageError);
      return res.status(500).json({ error: 'Error generating image for the course content.' });
    }

    // Structure the content into JSON format
    const structuredContent = {
      lesson_title: title,
      objectives: objectives,
      introduction: introduction,
      sections: content.split('\n\n').map(section => {
        const [firstLine, ...rest] = section.trim().split('\n');
        return {
          title: firstLine.trim(),
          content: rest.join('\n').trim(),
        };
      }),
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
      const docRef = await db.collection('explore').add({
        category,
        title,
        image: imageUrl, // Use the generated image URL
        description,
        content: structuredContent,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Return the structured JSON response
      res.json({
        id: docRef.id,
        category,
        title,
        image: imageUrl, // Include the image URL in the response
        description,
        content: structuredContent,
      });

    } catch (dbError)
          // Catching the database error
    console.error('Error saving full course content:', dbError);
    res.status(500).json({ error: 'Error saving full course content to the database.' });
    }

  } catch (error) {
    console.error('Error generating full course content:', error);
    res.status(500).json({ error: 'Error generating full course content.' });
  }
});



// Get all courses explored by user from firebase
router.get('/get-explore', async (req, res) => {
  try {
    const coursesSnapshot = await db.collection('explore').get();
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

//deleted explored course based on id
router.delete('/delete-explore/:id', async (req, res) => {
  try {
    const courseId = req.params.id; // Get the document ID from the route parameters
    const courseRef = db.collection('explore').doc(courseId);

    // Check if the document exists
    const doc = await courseRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Course not found.' });
    }

    // Delete the document
    await courseRef.delete();

    res.json({ message: 'Course successfully deleted.' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ error: 'Error deleting course.' });
  }
});
//View course generated course based on id
router.get('/get-explore/:id', async (req, res) => {
  try {
    const courseId = req.params.id; // Get the document ID from the route parameters
    const courseRef = db.collection('explore').doc(courseId);

    // Fetch the document
    const doc = await courseRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Course not found.' });
    }

    // Send the document data as JSON
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ error: 'Error fetching course.' });
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

//Search Endpoints 
router.get('/search', async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Please provide a query parameter.' });
  }

  try {
    let results = [];

    // Search courses by title, content, description, and conclusion
    const coursesTitleSnapshot = await db.collection('courses')
      .where('title', '>=', query)
      .where('title', '<=', query + '\uf8ff')
      .get();

    const coursesContentSnapshot = await db.collection('courses')
      .where('content', '>=', query)
      .where('content', '<=', query + '\uf8ff')
      .get();

    const coursesDescriptionSnapshot = await db.collection('courses')
      .where('description', '>=', query)
      .where('description', '<=', query + '\uf8ff')
      .get();

    const coursesConclusionSnapshot = await db.collection('courses')
      .where('conclusion', '>=', query)
      .where('conclusion', '<=', query + '\uf8ff')
      .get();

    // Search topics by title, content, description, and conclusion
    const topicsTitleSnapshot = await db.collection('topics')
      .where('title', '>=', query)
      .where('title', '<=', query + '\uf8ff')
      .get();

    const topicsContentSnapshot = await db.collection('topics')
      .where('content', '>=', query)
      .where('content', '<=', query + '\uf8ff')
      .get();

    const topicsDescriptionSnapshot = await db.collection('topics')
      .where('description', '>=', query)
      .where('description', '<=', query + '\uf8ff')
      .get();

    const topicsConclusionSnapshot = await db.collection('topics')
      .where('conclusion', '>=', query)
      .where('conclusion', '<=', query + '\uf8ff')
      .get();

    // Combine the results from each query
    coursesTitleSnapshot.forEach(doc => results.push({ id: doc.id, ...doc.data(), type: 'course' }));
    coursesContentSnapshot.forEach(doc => results.push({ id: doc.id, ...doc.data(), type: 'course' }));
    coursesDescriptionSnapshot.forEach(doc => results.push({ id: doc.id, ...doc.data(), type: 'course' }));
    coursesConclusionSnapshot.forEach(doc => results.push({ id: doc.id, ...doc.data(), type: 'course' }));

    topicsTitleSnapshot.forEach(doc => results.push({ id: doc.id, ...doc.data(), type: 'topic' }));
    topicsContentSnapshot.forEach(doc => results.push({ id: doc.id, ...doc.data(), type: 'topic' }));
    topicsDescriptionSnapshot.forEach(doc => results.push({ id: doc.id, ...doc.data(), type: 'topic' }));
    topicsConclusionSnapshot.forEach(doc => results.push({ id: doc.id, ...doc.data(), type: 'topic' }));

    // Filter duplicate entries
    results = [...new Map(results.map(item => [item.id, item])).values()];

    // Return the search results
    res.json(results);
  } catch (error) {
    console.error('Error searching:', error);
    res.status(500).json({ error: 'Error searching courses or topics.' });
  }
});

