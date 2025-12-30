const prisma = require('../config/prisma');

// Generic CRUD controller factory
const createCrudController = (model) => {
    return {
        getAll: async (req, res) => {
            try {
                const query = { orderBy: { order: 'asc' } };
                if (req.query.active === 'true') {
                    query.where = { isActive: true };
                }
                const items = await prisma[model].findMany(query);
                res.json(items);
            } catch (error) {
                res.status(500).json({ error: 'Internal server error' });
            }
        },

        create: async (req, res) => {
            try {
                const item = await prisma[model].create({ data: req.body });
                res.status(201).json(item);
            } catch (error) {
                res.status(500).json({ error: 'Internal server error' });
            }
        },

        update: async (req, res) => {
            try {
                const item = await prisma[model].update({
                    where: { id: parseInt(req.params.id) },
                    data: req.body
                });
                res.json(item);
            } catch (error) {
                res.status(500).json({ error: 'Internal server error' });
            }
        },

        delete: async (req, res) => {
            try {
                await prisma[model].delete({ where: { id: parseInt(req.params.id) } });
                res.json({ message: 'Deleted successfully' });
            } catch (error) {
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    };
};

module.exports = {
    clientLogoController: createCrudController('clientLogo'),
    technologyController: createCrudController('technology'),
    processStepController: createCrudController('processStep')
};
