// src/routes/authRoutes.js
const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();

// Sign-Up Route
router.post('/signup', async (req, res) => {
  const { fullName, phone, password} = req.body;

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if user already exists
    const userSnapshot = await db.collection('users').doc(phone).get();
    if (userSnapshot.exists) {
      return res.status(400).json({ error: 'User already exists.' });
    }

    // Create a new user document
    await db.collection('users').doc(phone).set({
      fullName,
      phone,
      passwordHash: hashedPassword,
      
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({ message: 'User signed up successfully.' });
  } catch (error) {
    console.error('Error signing up:', error);
    res.status(500).json({ error: 'Error signing up.' });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  const { phone, password } = req.body;

  try {
    const userDoc = await db.collection('users').doc(phone).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const userData = userDoc.data();

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, userData.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Check if preferences are already set
    if (!userData.farming_type || !userData.interests) {
      return res.status(200).json({ message: 'Login successful. Please set your preferences.' });
    }

    res.status(200).json({ message: 'Login successful.', user: userData });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Error logging in.' });
  }
});

// Check if number exists
router.post('/check-phone', async (req, res) => {
  const { phone } = req.body;

  try {
    const userDoc = await db.collection('users').doc(phone).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'No account associated with that number.' });
    }

    res.status(200).json({ message: 'Phone number exists.' });
  } catch (error) {
    console.error('Error checking phone number:', error);
    res.status(500).json({ error: 'Error checking phone number.' });
  }
});

// Set New Password Route
router.post('/reset-password', async (req, res) => {
  const { phone, newPassword } = req.body;

  try {
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Get user document reference
    const userRef = db.collection('users').doc(phone);

    // Check if user exists
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Update the user's password
    await userRef.update({
      passwordHash: hashedPassword,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(200).json({ message: 'Password updated successfully.' });
  } catch (error) {
    console.error('Error setting new password:', error);
    res.status(500).json({ error: 'Error setting new password.' });
  }
});

// Set Preferences Route
router.post('/set-preferences', async (req, res) => {
  const { phone, farming_type, interests } = req.body;

  try {
    const userRef = db.collection('users').doc(phone);

    await userRef.update({
      farming_type,
      interests,
    });

    res.status(200).json({ message: 'Preferences set successfully.' });
  } catch (error) {
    console.error('Error setting preferences:', error);
    res.status(500).json({ error: 'Error setting preferences.' });
  }
});

module.exports = router;
