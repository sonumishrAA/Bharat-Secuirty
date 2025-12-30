const express = require('express');
const { clientLogoController, technologyController, processStepController } = require('../controllers/cms.controller');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

// Helper to create routes
const createRoutes = (controller) => {
    const r = express.Router();
    r.get('/', controller.getAll);
    r.post('/', authMiddleware, requireRole('editor', 'super_admin'), controller.create);
    r.put('/:id', authMiddleware, requireRole('editor', 'super_admin'), controller.update);
    r.delete('/:id', authMiddleware, requireRole('editor', 'super_admin'), controller.delete);
    return r;
};

// Register sub-routers
router.use('/client-logos', createRoutes(clientLogoController));
router.use('/technologies', createRoutes(technologyController));
router.use('/process-steps', createRoutes(processStepController));

module.exports = router;
