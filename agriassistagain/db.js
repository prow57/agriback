const admin = require('firebase-admin');
const { getStorage } = require('firebase-admin/storage');

const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'agriassist-a7e77.appspot.com',
});

const db = admin.firestore();
const storage = getStorage().bucket();

module.exports = { db, storage };
