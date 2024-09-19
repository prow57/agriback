//cropRoutes.js
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

    if (url === PLANT_ID_IDENTIFICATION_URL) {
        formData.append('classification_level', 'all');
        formData.append('similar_images', 'true');
    }

    if (url === PLANT_ID_HEALTH_ASSESSMENT_URL) {
        formData.append('classification_level', 'species');
        formData.append('health', 'only');
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

/**
 * @swagger
 * /identify:
 *   post:
 *     summary: Identify a plant or crop from an image such as weeds or animal feeds
       tags: [Leaf-Scan]
 *     description: Upload an image to identify the plant or crop and store the result in Firestore.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file for identification.
 *     responses:
 *       200:
 *         description: Successful identification of the plant.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                 id:
 *                   type: string
 *       400:
 *         description: Image file is required.
 *       500:
 *         description: Failed to identify the plant.
 */
router.post('/identify', upload.single('image'), async (req, res) => {
    const { file } = req;
    if (!file) {
        return res.status(400).json({ error: 'Image file is required' });
    }

    try {
        const result = await analyzeImage(file.buffer, PLANT_ID_IDENTIFICATION_URL);
        
        const docRef = admin.firestore().collection('plant_identifications').doc();
        const docId = docRef.id;
        
        await docRef.set({
            id: docId,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            result,
        });

        res.json({ message: 'Plant identified', data: result, id: docId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to identify the plant' });
    }
});

/**
 * @swagger
 * /health-analysis:
 *   post:
 *     summary: Analyze the health of a plant from an image
       tags: [Leaf-Scan]
 *     description: Upload an image to assess the health of the plant and store the result in Firestore.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file for health analysis.
 *     responses:
 *       200:
 *         description: Successful health analysis of the plant.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                 id:
 *                   type: string
 *       400:
 *         description: Image file is required.
 *       500:
 *         description: Failed to analyze crop health.
 */
router.post('/health-analysis', upload.single('image'), async (req, res) => {
    const { file } = req;
    if (!file) {
        return res.status(400).json({ error: 'Image file is required' });
    }

    try {
        const result = await analyzeImage(file.buffer, PLANT_ID_HEALTH_ASSESSMENT_URL);
        
        const docRef = admin.firestore().collection('health_assessments').doc();
        const docId = docRef.id;
        
        await docRef.set({
            id: docId,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            result,
        });

        res.json({ message: 'Health analysis complete', data: result, id: docId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to analyze crop health' });
    }
});

/**
 * @swagger
 * /identify/{id}:
 *   get:
 *     summary: Get a single plant identification by id
       tags: [Leaf-Scan]
 *     description: Retrieve a plant identification result by its I.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the plant identification.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved plant identification.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 data:
 *                   type: object
 *       404:
 *         description: Plant identification not found.
 *       500:
 *         description: Failed to retrieve plant identification.
 */
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

/**
 * @swagger
 * /health-analysis/{id}:
 *   get:
 *     summary: Get a single health assessment by ID
       tags: [Leaf-Scan]
 *     description: Retrieve a health assessment result by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the health assessment.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved health assessment.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 data:
 *                   type: object
 *       404:
 *         description: Health assessment not found.
 *       500:
 *         description: Failed to retrieve health assessment.
 */
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
