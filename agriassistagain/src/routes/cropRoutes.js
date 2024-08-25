const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const admin = require('firebase-admin');
const { getStorage } = require('firebase-admin/storage');
const db = admin.firestore();
const storage = getStorage().bucket();
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();



// Multer setup for image uploads (in-memory storage)
const upload = multer({ storage: multer.memoryStorage() });

// Plant.id API details for v3
const PLANT_ID_API_KEY = process.env.PLANT_ID_API_KEY;
const PLANT_ID_IDENTIFICATION_URL = 'https://api.plant.id/v3/identification';
const PLANT_ID_HEALTH_ASSESSMENT_URL = 'https://api.plant.id/v3/health_assessment';

async function uploadImageToFirebase(file) {
  const uuid = uuidv4();
  const fileName = `${uuid}-${file.originalname}`;
  const blob = storage.file(fileName);
  const blobStream = blob.createWriteStream({
    metadata: {
      contentType: file.mimetype,
    },
  });

  return new Promise((resolve, reject) => {
    blobStream.on('error', (err) => reject(err));

    blobStream.on('finish', async () => {
      const publicUrl = `https://storage.googleapis.com/${storage.name}/${blob.name}`;
      resolve(publicUrl);
    });

    blobStream.end(file.buffer);
  });
}


// 1. Crop Vision - Identify Crop or Plant Name
router.post('/identify', upload.single('image'), async (req, res) => {
    const { file } = req;
    if (!file) {
        return res.status(400).json({ error: 'Image file is required' });
    }

    try {
        // Generate a unique file name and upload to Firebase Storage
        const fileName = `plants/${uuidv4()}.jpg`;
        const imageUrl = await uploadImageToFirebase(file.buffer, fileName);

        // Make the API call to Plant.id v3 for identification
        const response = await axios.post(PLANT_ID_IDENTIFICATION_URL, {
            api_key: PLANT_ID_API_KEY,
            images: [imageUrl],
            modifiers: ["crops_fast"],
            plant_language: "en",
            plant_details: ["common_names", "url", "wiki_description", "taxonomy", "synonyms", "edible_parts"]
        });

        // Save the identification result to Firestore
        const result = response.data;
        const docRef = await db.collection('plant_identifications').add({
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            image_url: imageUrl,
            result,
        });

        // Return the identification result
        res.json({ message: 'Plant identified', data: result, id: docRef.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to identify the plant' });
    }
});

// 2. Crop Vision - Health Analysis using health assessment endpoint
router.post('/health-analysis', upload.single('image'), async (req, res) => {
    const { file } = req;
    if (!file) {
        return res.status(400).json({ error: 'Image file is required' });
    }

    try {
        // Generate a unique file name and upload to Firebase Storage
        const fileName = `health_assessments/${uuidv4()}.jpg`;
        const imageUrl = await uploadImageToFirebase(file.buffer, fileName);

        // Make the API call to Plant.id v3 for health assessment
        const response = await axios.post(PLANT_ID_HEALTH_ASSESSMENT_URL, {
            api_key: PLANT_ID_API_KEY,
            images: [imageUrl],
            health: "only",
            plant_language: "en",
            plant_details: ["local_name", "description", "url", "treatment", "classification", "common_names", "cause"]
        });

        // Save the health analysis result to Firestore
        const result = response.data;
        const docRef = await db.collection('health_assessments').add({
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            image_url: imageUrl,
            result,
        });

        // Return the health analysis result
        res.json({ message: 'Health analysis complete', data: result, id: docRef.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to analyze crop health' });
    }
});

// Export the router
module.exports = router;
