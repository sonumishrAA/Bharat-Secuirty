const prisma = require('../config/prisma');
const { z } = require('zod');

const testimonialSchema = z.object({
    clientName: z.string().min(1),
    company: z.string().optional(),
    role: z.string().optional(),
    content: z.string().min(1),
    rating: z.number().int().min(1).max(5).default(5),
    avatar: z.string().optional(),
    isActive: z.boolean().default(true),
    isFeatured: z.boolean().default(false),
    order: z.number().int().default(0)
});

const getAllTestimonials = async (req, res) => {
    try {
        const { active, featured } = req.query;
        const where = {};

        if (active === 'true') where.isActive = true;
        if (featured === 'true') where.isFeatured = true;

        const testimonials = await prisma.testimonial.findMany({
            where,
            orderBy: { order: 'asc' }
        });
        res.json(testimonials);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getTestimonialById = async (req, res) => {
    try {
        const { id } = req.params;
        const testimonial = await prisma.testimonial.findUnique({
            where: { id: parseInt(id) }
        });
        if (!testimonial) return res.status(404).json({ error: 'Testimonial not found' });
        res.json(testimonial);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

const createTestimonial = async (req, res) => {
    try {
        const data = testimonialSchema.parse(req.body);
        const testimonial = await prisma.testimonial.create({ data });
        res.status(201).json(testimonial);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};

const updateTestimonial = async (req, res) => {
    try {
        const { id } = req.params;
        const data = testimonialSchema.partial().parse(req.body);
        const testimonial = await prisma.testimonial.update({
            where: { id: parseInt(id) },
            data
        });
        res.json(testimonial);
    } catch (error) {
        if (error.code === 'P2025') return res.status(404).json({ error: 'Testimonial not found' });
        res.status(500).json({ error: 'Internal server error' });
    }
};

const deleteTestimonial = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.testimonial.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'Testimonial deleted' });
    } catch (error) {
        if (error.code === 'P2025') return res.status(404).json({ error: 'Testimonial not found' });
        res.status(500).json({ error: 'Internal server error' });
    }
};

const toggleFeatured = async (req, res) => {
    try {
        const { id } = req.params;
        const testimonial = await prisma.testimonial.findUnique({
            where: { id: parseInt(id) }
        });

        if (!testimonial) return res.status(404).json({ error: 'Testimonial not found' });

        const updated = await prisma.testimonial.update({
            where: { id: parseInt(id) },
            data: { isFeatured: !testimonial.isFeatured }
        });

        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

const reorderTestimonials = async (req, res) => {
    try {
        const { testimonials } = req.body; // Array of { id, order }
        if (!Array.isArray(testimonials)) {
            return res.status(400).json({ error: 'Invalid request format' });
        }

        const updates = testimonials.map(({ id, order }) =>
            prisma.testimonial.update({
                where: { id: parseInt(id) },
                data: { order: parseInt(order) }
            })
        );

        await prisma.$transaction(updates);
        res.json({ message: 'Testimonials reordered successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getAllTestimonials,
    getTestimonialById,
    createTestimonial,
    updateTestimonial,
    deleteTestimonial,
    toggleFeatured,
    reorderTestimonials
};
