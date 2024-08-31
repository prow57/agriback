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
        formData.append('classification_level', 'all');
        formData.append('similar_images', 'true'); // Include similar 
       // formData.append('plant_language', 'en');
    }

    // Additional form data for Health Analysis API
    if (url === PLANT_ID_HEALTH_ASSESSMENT_URL) {
        formData.append('classification_level', 'species');
        formData.append('health', 'only'); // Focus on health
        //formData.append('plant_language', 'en');
        formData.append('similar_images', 'true');
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

// 1. Create - Crop Vision - Identify Crop or Plant Name with ID
router.post('/identify', upload.single('image'), async (req, res) => {
    const { file } = req;
    if (!file) {
        return res.status(400).json({ error: 'Image file is required' });
    }

    try {
        const result = await analyzeImage(file.buffer, PLANT_ID_IDENTIFICATION_URL);
        
        // Generate a new document reference with an ID
        const docRef = admin.firestore().collection('plant_identifications').doc();
        const docId = docRef.id;
        
        // Save the result to Firestore with the generated ID
        await docRef.set({
            id: docId, // Include the ID in the document
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            result,
        });

        res.json({ message: 'Plant identified', data: result, id: docId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to identify the plant' });
    }
});

// 2. Create - Crop Vision - Health Analysis with ID
router.post('/health-analysis', upload.single('image'), async (req, res) => {
    const { file } = req;
    if (!file) {
        return res.status(400).json({ error: 'Image file is required' });
    }

    try {
        const result = await analyzeImage(file.buffer, PLANT_ID_HEALTH_ASSESSMENT_URL);
        
        // Generate a new document reference with an ID
        const docRef = admin.firestore().collection('health_assessments').doc();
        const docId = docRef.id;
        
        // Save the result to Firestore with the generated ID
        await docRef.set({
            id: docId, // Include the ID in the document
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            result,
        });

        res.json({ message: 'Health analysis complete', data: result, id: docId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to analyze crop health' });
    }
});



// 3. Read - Get a single plant identification by ID
router.get('/identify/:id', async (req, res) => {
    try {
        const doc = await admin.firestore().collection('plant_identifications').doc(req.params.id).get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Plant identification not found' });
        }
        res.json({ id: doc.id, data: doc.data() });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve plant identification' });
    }
});

// 4. Read - Get a single health assessment by ID
router.get('/health-analysis/:id', async (req, res) => {
    try {
        const doc = await admin.firestore().collection('health_assessments').doc(req.params.id).get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Health assessment not found' });
        }
        res.json({ id: doc.id, data: doc.data() });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve health assessment' });
    }
});

module.exports = router;
