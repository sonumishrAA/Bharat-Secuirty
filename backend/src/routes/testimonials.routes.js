const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const testimonialsController = require('../controllers/testimonials.controller');

// Public
router.get('/', testimonialsController.getAllTestimonials);
router.get('/:id', testimonialsController.getTestimonialById);

// Protected (Editor+)
router.post('/', authenticate, requireRole('editor', 'super_admin'), testimonialsController.createTestimonial);
router.put('/:id', authenticate, requireRole('editor', 'super_admin'), testimonialsController.updateTestimonial);
router.put('/:id/toggle-featured', authenticate, requireRole('editor', 'super_admin'), testimonialsController.toggleFeatured);
router.put('/bulk/reorder', authenticate, requireRole('editor', 'super_admin'), testimonialsController.reorderTestimonials);

// Protected (Super Admin)
router.delete('/:id', authenticate, requireRole('super_admin'), testimonialsController.deleteTestimonial);

module.exports = router;
