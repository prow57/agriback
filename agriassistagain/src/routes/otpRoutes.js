//otpRoutes.js

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
/**
 * @swagger
 * /send-otp:
 *   post:
 *     summary: Send OTP to the user's phone
       tags : [Otp-Verification]
 *     description: Generates a 6-digit OTP and sends it to the specified phone number via SMS.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *                 description: The phone number to send the OTP to (without the country code).
 *     responses:
 *       200:
 *         description: OTP sent successfully.
 *       500:
 *         description: Error sending OTP.
 */
router.post('/send-otp', async (req, res) => {
    const { phone } = req.body;

    try {
        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store OTP in Firestore with expiration time (5 minutes)
        const expirationTime = admin.firestore.FieldValue.serverTimestamp();
        await db.collection('otp').doc(phone).set({
            otp: otp,
            createdAt: expirationTime,
            expiresAt: expirationTime + 300000, // 5 minutes in milliseconds
        });

        // Send OTP via Africa's Talking
        await sms.send({
            to: [`+${phone}`],
            message: `Your OTP is ${otp}`
        });

        res.status(200).json({ message: 'OTP sent successfully.' });
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ error: 'Error sending OTP.' });
    }
});

// Route to verify OTP
/**
 * @swagger
 * /verify-otp:
 *   post:
 *     summary: Verify OTP provided by the user
 *     description: Checks the provided OTP against the stored OTP in Firestore.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *                 description: The phone number associated with the OTP.
 *               otp:
 *                 type: string
 *                 description: The OTP provided by the user.
 *     responses:
 *       200:
 *         description: OTP verified successfully.
 *       404:
 *         description: OTP not found or expired.
 *       401:
 *         description: Invalid OTP.
 *       500:
 *         description: Error verifying OTP.
 */
router.post('/verify-otp', async (req, res) => {
    const { phone, otp } = req.body;

    try {
        const otpDoc = await db.collection('otp').doc(phone).get();

        if (!otpDoc.exists) {
            return res.status(404).json({ error: 'OTP not found or expired.' });
        }

        const otpData = otpDoc.data();
        const currentTime = Date.now();

        // Check if OTP is expired
        if (currentTime > otpData.expiresAt) {
            return res.status(404).json({ error: 'OTP has expired.' });
        }

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
