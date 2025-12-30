const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const statisticsController = require('../controllers/statistics.controller');

router.get('/', statisticsController.getAllStatistics);
router.get('/:id', statisticsController.getStatisticById);
router.post('/', authenticate, requireRole('editor', 'super_admin'), statisticsController.createStatistic);
router.put('/:id', authenticate, requireRole('editor', 'super_admin'), statisticsController.updateStatistic);
router.delete('/:id', authenticate, requireRole('super_admin'), statisticsController.deleteStatistic);
router.put('/bulk/reorder', authenticate, requireRole('editor', 'super_admin'), statisticsController.reorderStatistics);

module.exports = router;
