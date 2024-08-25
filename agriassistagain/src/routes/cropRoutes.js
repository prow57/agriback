const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
require('dotenv').config(); 

// Initialize Firestore
const db = admin.firestore();

// Multer setup for image uploads 
const upload = multer({ dest: 'uploads/' });

// Plant.id API details for v3
const PLANT_ID_API_KEY = process.env.PLANT_ID_API_KEY; // Retrieved from .env
const PLANT_ID_IDENTIFICATION_URL = 'https://api.plant.id/v3/identification';
const PLANT_ID_HEALTH_ASSESSMENT_URL = 'https://api.plant.id/v3/health_assessment';

// 1. Crop Vision - Identify Crop or Plant Name
router.post('/identify', upload.single('image'), async (req, res) => {
    const { file } = req;
    if (!file) {
        return res.status(400).json({ error: 'Image file is required' });
    }

    try {
        // Read the file and convert to base64
        const imageFilePath = path.resolve(file.path);
        const imageData = fs.readFileSync(imageFilePath);
        const base64Image = imageData.toString('base64');

        // Make the API call to Plant.id v3 for identification
        const response = await axios.post(PLANT_ID_IDENTIFICATION_URL, {
            api_key: PLANT_ID_API_KEY,
            images: [base64Image], // Base64 encoded image
            modifiers: ["crops_fast"], // Optional modifiers
            plant_language: "en", // Language preference
            plant_details: ["common_names", "url", "wiki_description", "taxonomy", "synonyms", "edible_parts"]
        });

        // Save the identification result to Firestore
        const result = response.data;
        const docRef = await db.collection('plant_identifications').add({
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            image: base64Image,
            result,
        });

        // Return the identification result
        res.json({ message: 'Plant identified', data: result, id: docRef.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to identify the plant' });
    } finally {
        // Clean up the uploaded file
        fs.unlinkSync(file.path);
    }
});

// 2. Crop Vision - Health Analysis using health assessment endpoint
router.post('/health-analysis', upload.single('image'), async (req, res) => {
    const { file } = req;
    if (!file) {
        return res.status(400).json({ error: 'Image file is required' });
    }

    try {
        // Read the file and prepare it for the API request
        const imageFilePath = path.resolve(file.path);
        const imageData = fs.readFileSync(imageFilePath);
        const base64Image = imageData.toString('base64');

        // Make the API call to Plant.id v3 for health assessment
        const response = await axios.post(PLANT_ID_HEALTH_ASSESSMENT_URL, {
            api_key: PLANT_ID_API_KEY,
            images: [base64Image],
            health: "only", // Ensure that only health assessment is performed
            plant_language: "en",
            plant_details: ["local_name", "description", "url", "treatment", "classification", "common_names", "cause"]
        });

        // Save the health analysis result to Firestore
        const result = response.data;
        const docRef = await db.collection('health_assessments').add({
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            image: base64Image,
            result,
        });

        // Return the health analysis result
        res.json({ message: 'Health analysis complete', data: result, id: docRef.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to analyze crop health' });
    } finally {
        // Clean up the uploaded file
        fs.unlinkSync(file.path);
    }
});

// Export the router
module.exports = router;
