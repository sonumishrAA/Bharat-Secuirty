const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');
const mediaController = require('../controllers/media.controller');

router.post('/upload', authenticate, requireRole('editor', 'super_admin'), upload.single('file'), mediaController.uploadFile);
router.get('/', authenticate, mediaController.getAllMedia);
router.get('/:id', authenticate, mediaController.getMediaById);
router.put('/:id', authenticate, requireRole('editor', 'super_admin'), mediaController.updateMedia);
router.delete('/:id', authenticate, requireRole('super_admin'), mediaController.deleteMedia);

module.exports = router;
