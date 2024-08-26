const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const admin = require('firebase-admin');
const FormData = require('form-data');
require('dotenv').config();

const PLANT_ID_API_KEY = process.env.PLANT_ID_API_KEY;
const PLANT_ID_IDENTIFICATION_URL = 'https://api.plant.id/v3/identification';
const PLANT_ID_HEALTH_ASSESSMENT_URL = 'https://api.plant.id/v3/health_assessment';

// Multer setup for image uploads (in-memory storage)
const upload = multer({ storage: multer.memoryStorage() });

// Plant.id API call function
async function analyzeImage(imageBuffer, url) {
    const formData = new FormData();
    formData.append('api_key', PLANT_ID_API_KEY);
    formData.append('images', imageBuffer, { filename: 'image.jpg', contentType: 'image/jpeg' });

    // Additional form data for Plant Identification API
    if (url === PLANT_ID_IDENTIFICATION_URL) {
        // Remove the unsupported 'crops_fast' modifier
        formData.append('plant_language', 'en');
        formData.append('plant_details', ['common_names', 'url', 'wiki_description', 'taxonomy', 'synonyms', 'edible_parts'].join(','));
    }

    // Additional form data for Health Analysis API
    if (url === PLANT_ID_HEALTH_ASSESSMENT_URL) {
        formData.append('health', 'only');
        formData.append('plant_language', 'en');
        formData.append('plant_details', ['local_name', 'description', 'url', 'treatment', 'classification', 'common_names', 'cause'].join(','));
    }

    try {
        const response = await axios.post(url, formData, {
            headers: {
                ...formData.getHeaders()
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error analyzing image:', error.response ? error.response.data : error.message);
        throw new Error('Error analyzing image');
    }
}

// 1. Crop Vision - Identify Crop or Plant Name
router.post('/identify', upload.single('image'), async (req, res) => {
    const { file } = req;
    if (!file) {
        return res.status(400).json({ error: 'Image file is required' });
    }

    try {
        const result = await analyzeImage(file.buffer, PLANT_ID_IDENTIFICATION_URL);
        
        // Save the result to Firestore
        const docRef = await admin.firestore().collection('plant_identifications').add({
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            result,
        });

        res.json({ message: 'Plant identified', data: result, id: docRef.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to identify the plant' });
    }
});

// 2. Crop Vision - Health Analysis
router.post('/health-analysis', upload.single('image'), async (req, res) => {
    const { file } = req;
    if (!file) {
        return res.status(400).json({ error: 'Image file is required' });
    }

    try {
        const result = await analyzeImage(file.buffer, PLANT_ID_HEALTH_ASSESSMENT_URL);

        // Save the result to Firestore
        const docRef = await admin.firestore().collection('health_assessments').add({
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            result,
        });

        res.json({ message: 'Health analysis complete', data: result, id: docRef.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to analyze crop health' });
    }
});

module.exports = router;
