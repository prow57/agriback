// Initialize Firebase Admin SDK
const admin = require('firebase-admin');
require('dotenv').config(); // Load environment variables early

const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore(); // Initialize Firestore

// Export db so it can be used in other modules
module.exports = { db };

//index.js

const express = require('express');
const cors = require('cors');

// Import routes
const courseRoutes = require('./src/routes/courseRoutes');
const adviceRoutes = require('./src/routes/adviceRoutes');
const chatRoutes = require('./src/routes/chatRoutes');
const authRoutes = require('./src/routes/authRoutes');
const otpRoutes = require('./src/routes/otpRoutes');
const cropRoutes = require('./src/routes/cropRoutes'); // Uncomment when needed

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes for Endpoints 
app.use('/api/verify', otpRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/advice', adviceRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/vision', cropRoutes); // Uncomment when needed

// Default route
app.get('/', (req, res) => {
  res.send('Agri-Assist-AI Backend API is running');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
