const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();
require('dotenv').config();

// Initialize Twilio with Account SID and Auth Token
const twilio = require('twilio');
const client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

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

    // Send OTP via Twilio
    await client.messages.create({
      body: `Your OTP is ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });

    res.status(200).json({ message: 'OTP sent successfully.' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ error: 'Error sending OTP.' });
  }
});

// Route to verify OTP
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
