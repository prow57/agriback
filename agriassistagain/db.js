const admin = require('firebase-admin');
const { getStorage } = require('firebase-admin/storage');

// Initialize Firebase Admin
const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'gs://agriassist-a7e77.appspot.com', // Ensure this is a string
});

// Initialize Firestore and Storage
const db = admin.firestore();
const storage = getStorage().bucket();

module.exports = { db, storage };
