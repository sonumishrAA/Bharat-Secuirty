const express = require('express');
const { getAllServices, getServiceBySlug, createService, updateService, deleteService, toggleFeatured, reorderServices } = require('../controllers/services.controller');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

// Public
router.get('/', getAllServices);
router.get('/:slug', getServiceBySlug);

// Protected (Editor+)
router.post('/', authenticate, requireRole('editor', 'super_admin'), createService);
router.put('/:id', authenticate, requireRole('editor', 'super_admin'), updateService);
router.put('/:id/toggle-featured', authenticate, requireRole('editor', 'super_admin'), toggleFeatured);
router.put('/bulk/reorder', authenticate, requireRole('editor', 'super_admin'), reorderServices);

// Protected (Super Admin)
router.delete('/:id', authenticate, requireRole('super_admin'), deleteService);

module.exports = router;

