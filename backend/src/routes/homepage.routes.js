const express = require('express');
const { getAllSections, getSection, updateSection } = require('../controllers/homepage.controller');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', getAllSections);
router.get('/:key', getSection);
router.put('/:key', authMiddleware, requireRole('editor', 'super_admin'), updateSection);

module.exports = router;
