const express = require('express');
const { getAllCaseStudies, getCaseStudyBySlug, createCaseStudy, updateCaseStudy, deleteCaseStudy } = require('../controllers/caseStudies.controller');
const { authenticate, requireRole } = require('../middleware/auth');

const upload = require('../middleware/upload');

const router = express.Router();

router.get('/', getAllCaseStudies);
router.get('/:slug', getCaseStudyBySlug);

router.post('/', authenticate, requireRole('editor', 'super_admin'), upload.single('image'), createCaseStudy);
router.put('/:id', authenticate, requireRole('editor', 'super_admin'), upload.single('image'), updateCaseStudy);
router.delete('/:id', authenticate, requireRole('super_admin'), deleteCaseStudy);

module.exports = router;

