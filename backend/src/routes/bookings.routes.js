const express = require('express');
const {
    createBooking,
    getAllBookings,
    getBookingById,
    updateBookingStatus,
    getClientBookings,
    getClientBookingById
} = require('../controllers/bookings.controller');
const { authMiddleware: adminAuth } = require('../middleware/auth'); // Fixed import
const { authenticateClient } = require('../middleware/clientAuth');
const upload = require('../middleware/upload');

const router = express.Router();

// ==================== PUBLIC ====================
// Submit Booking (Auto-register client)
router.post('/', upload.single('document'), createBooking);

// ==================== ADMIN ====================
router.get('/', adminAuth, getAllBookings);
router.get('/:id', adminAuth, getBookingById);
router.patch('/:id/status', adminAuth, updateBookingStatus);

// ==================== CLIENT PORTAL ====================
router.get('/client/list', authenticateClient, getClientBookings);
router.get('/client/:id', authenticateClient, getClientBookingById);

module.exports = router;
