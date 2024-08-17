// src/index.js

const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
require('dotenv').config();

const courseRoutes = require('./routes/courseRoutes');
const adviceRoutes = require('./routes/adviceRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Firebase Admin SDK
const serviceAccount = require('../firebaseServiceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/courses', courseRoutes);
app.use('/api/advice', adviceRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('Agriculture Backend API is running');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
