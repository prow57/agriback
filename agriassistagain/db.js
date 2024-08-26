// Initialize Firebase Admin SDK
const admin = require('firebase-admin');
require('dotenv').config(); // Load environment variables early

const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: gs://agriassist-a7e77.appspot.com,
});

const bucket = admin.storage().bucket();
const db = admin.firestore(); // Initialize Firestore

// Export db so it can be used in other modules
module.exports = { db,bucket };
