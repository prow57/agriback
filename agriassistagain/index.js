// index.js

const express = require('express');
const cors = require('cors');
const admin = require("firebase-admin");
const db = require("./db");

require('dotenv').config();

const courseRoutes = require('./src/routes/courseRoutes');
const adviceRoutes = require('./src/routes/adviceRoutes');
const chatRoutes = require('./src/routes/chatRoutes');
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Firebase Admin SDK


// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/advice', adviceRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/user',userRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('Agri-Assist-AI Backend API is running');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
