const express = require('express');
const router = express.Router();
const { login, getProfile, updateProfile, changePassword, forgotPassword } = require('../controllers/clientAuth.controller');
const { authenticateClient } = require('../middleware/clientAuth');

// Public routes
router.post('/login', login);
router.post('/register', (req, res) => res.status(403).json({ error: 'Registration is closed. Please submit a booking request.' })); // Auto-reg only
router.post('/forgot-password', forgotPassword);

// Protected routes
router.get('/profile', authenticateClient, getProfile);
router.put('/profile', authenticateClient, updateProfile);
router.put('/change-password', authenticateClient, changePassword);

module.exports = router;
