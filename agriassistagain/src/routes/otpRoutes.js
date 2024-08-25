const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();
require('dotenv').config();

// Initialize Africa's Talking
const africastalking = require('africastalking')({
    apiKey: process.env.AT_API_KEY, // Your Africa's Talking API key
    username: process.env.AT_USERNAME // Your Africa's Talking username
});

const sms = africastalking.SMS;

// Route to send OTP
router.post('/send-otp', async (req, res) => {
  const { phone } = req.body;

  try {
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in Firestore (or any database) with expiration time
    await db.collection('otp').doc(phone).set({
      otp: otp,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Send OTP via Africa's Talking
    const response = await sms.send({
      to: [`+${phone}`],
      message: `Your OTP is ${otp}`
    });

    res.status(200).json({ message: 'OTP sent successfully.', response });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ error: 'Error sending OTP.' });
  }
});

// Route to verify OTP (same as before)
router.post('/verify-otp', async (req, res) => {
  const { phone, otp } = req.body;

  try {
    const otpDoc = await db.collection('otp').doc(phone).get();

    if (!otpDoc.exists) {
      return res.status(404).json({ error: 'OTP not found or expired.' });
    }

    const otpData = otpDoc.data();

    if (otpData.otp === otp) {
      // OTP is correct
      res.status(200).json({ message: 'OTP verified successfully.' });
    } else {
      // OTP is incorrect
      res.status(401).json({ error: 'Invalid OTP.' });
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ error: 'Error verifying OTP.' });
  }
});

module.exports = router;
