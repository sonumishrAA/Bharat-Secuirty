const prisma = require('../config/prisma');
const { z } = require('zod');

const statisticSchema = z.object({
    label: z.string().min(1),
    value: z.string().min(1),
    icon: z.string().optional(),
    order: z.number().int().default(0),
    isActive: z.boolean().default(true)
});

const getAllStatistics = async (req, res) => {
    try {
        const { active } = req.query;
        const where = active === 'true' ? { isActive: true } : {};
        const statistics = await prisma.statistic.findMany({
            where,
            orderBy: { order: 'asc' }
        });
        res.json(statistics);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getStatisticById = async (req, res) => {
    try {
        const { id } = req.params;
        const statistic = await prisma.statistic.findUnique({
            where: { id: parseInt(id) }
        });
        if (!statistic) return res.status(404).json({ error: 'Statistic not found' });
        res.json(statistic);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

const createStatistic = async (req, res) => {
    try {
        const data = statisticSchema.parse(req.body);
        const statistic = await prisma.statistic.create({ data });
        res.status(201).json(statistic);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};

const updateStatistic = async (req, res) => {
    try {
        const { id } = req.params;
        const data = statisticSchema.partial().parse(req.body);
        const statistic = await prisma.statistic.update({
            where: { id: parseInt(id) },
            data
        });
        res.json(statistic);
    } catch (error) {
        if (error.code === 'P2025') return res.status(404).json({ error: 'Statistic not found' });
        res.status(500).json({ error: 'Internal server error' });
    }
};

const deleteStatistic = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.statistic.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'Statistic deleted' });
    } catch (error) {
        if (error.code === 'P2025') return res.status(404).json({ error: 'Statistic not found' });
        res.status(500).json({ error: 'Internal server error' });
    }
};

const reorderStatistics = async (req, res) => {
    try {
        const { statistics } = req.body; // Array of { id, order }
        if (!Array.isArray(statistics)) {
            return res.status(400).json({ error: 'Invalid request format' });
        }

        const updates = statistics.map(({ id, order }) =>
            prisma.statistic.update({
                where: { id: parseInt(id) },
                data: { order: parseInt(order) }
            })
        );

        await prisma.$transaction(updates);
        res.json({ message: 'Statistics reordered successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getAllStatistics,
    getStatisticById,
    createStatistic,
    updateStatistic,
    deleteStatistic,
    reorderStatistics
};
