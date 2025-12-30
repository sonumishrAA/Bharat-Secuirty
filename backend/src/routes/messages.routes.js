const express = require('express');
const { sendMessage, markAsRead } = require('../controllers/messages.controller');
const { authMiddleware: adminAuth } = require('../middleware/auth');
const { authenticateClient } = require('../middleware/clientAuth');
const upload = require('../middleware/upload');

const router = express.Router();

// Both Client and Admin use the same endpoints, middleware distinguishes them

// Client Routes
router.post('/client/:bookingId', authenticateClient, upload.single('attachment'), sendMessage);
router.put('/client/:bookingId/read', authenticateClient, markAsRead);

// Admin Routes
router.post('/admin/:bookingId', adminAuth, upload.single('attachment'), sendMessage);
router.put('/admin/:bookingId/read', adminAuth, markAsRead);

module.exports = router;
