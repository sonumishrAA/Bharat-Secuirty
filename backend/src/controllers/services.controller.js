const prisma = require('../config/prisma');
const { z } = require('zod');

const serviceSchema = z.object({
    title: z.string().min(1),
    slug: z.string().min(1),
    type: z.enum(['web_pentest', 'mobile_pentest', 'osint', 'incident_response', 'training']),
    icon: z.string().optional(),
    shortDescription: z.string().optional(),
    fullDescription: z.string().optional(),
    features: z.array(z.string()).optional(),
    benefits: z.array(z.string()).optional(),
    isActive: z.boolean().default(true)
});

const getAllServices = async (req, res) => {
    const { role } = req.query; // If querying as admin
    const where = role ? {} : { isActive: true };
    const services = await prisma.service.findMany({ where });
    res.json(services);
};

const getServiceBySlug = async (req, res) => {
    const { slug } = req.params;
    const service = await prisma.service.findUnique({ where: { slug } });
    if (!service) return res.status(404).json({ error: 'Service not found' });
    res.json(service);
};

const createService = async (req, res) => {
    try {
        const data = serviceSchema.parse(req.body);
        const service = await prisma.service.create({
            data: {
                ...data,
                features: data.features ? JSON.stringify(data.features) : undefined,
                benefits: data.benefits ? JSON.stringify(data.benefits) : undefined
            }
        });
        res.status(201).json(service);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        // Check for unique key violation (slug)
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Slug must be unique' });
        }
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};

const updateService = async (req, res) => {
    const { id } = req.params;
    try {
        const data = serviceSchema.partial().parse(req.body);
        const service = await prisma.service.update({
            where: { id: parseInt(id) },
            data: {
                ...data,
                features: data.features ? JSON.stringify(data.features) : undefined,
                benefits: data.benefits ? JSON.stringify(data.benefits) : undefined
            }
        });
        res.json(service);
    } catch (error) {
        if (error.code === 'P2025') return res.status(404).json({ error: 'Service not found' });
        res.status(500).json({ error: 'Internal server error' });
    }
};

const deleteService = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.service.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'Service deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

const toggleFeatured = async (req, res) => {
    try {
        const { id } = req.params;
        const service = await prisma.service.findUnique({
            where: { id: parseInt(id) }
        });

        if (!service) return res.status(404).json({ error: 'Service not found' });

        const updated = await prisma.service.update({
            where: { id: parseInt(id) },
            data: { isFeatured: !service.isFeatured }
        });

        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

const reorderServices = async (req, res) => {
    try {
        const { services } = req.body; // Array of { id, order }
        if (!Array.isArray(services)) {
            return res.status(400).json({ error: 'Invalid request format' });
        }

        const updates = services.map(({ id, order }) =>
            prisma.service.update({
                where: { id: parseInt(id) },
                data: { order: parseInt(order) }
            })
        );

        await prisma.$transaction(updates);
        res.json({ message: 'Services reordered successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { getAllServices, getServiceBySlug, createService, updateService, deleteService, toggleFeatured, reorderServices };

