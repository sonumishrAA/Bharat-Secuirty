const prisma = require('../config/prisma');
const { z } = require('zod');
const { sanitizeHtml } = require('../utils/sanitize');

const caseStudySchema = z.object({
    title: z.string().min(1),
    slug: z.string().min(1),
    clientName: z.string().optional(),
    category: z.string().optional(),
    coverImageUrl: z.string().optional(),
    summary: z.string().optional(),
    content: z.string().optional(), // HTML content
    isPublished: z.boolean().default(false)
});

const getAllCaseStudies = async (req, res) => {
    const { role } = req.query;
    const where = role ? {} : { isPublished: true };
    const studies = await prisma.caseStudy.findMany({
        where,
        orderBy: { createdAt: 'desc' }
    });
    res.json(studies);
};

const getCaseStudyBySlug = async (req, res) => {
    const { slug } = req.params;
    const study = await prisma.caseStudy.findUnique({ where: { slug } });
    if (!study) return res.status(404).json({ error: 'Not found' });
    res.json(study);
};

const createCaseStudy = async (req, res) => {
    try {
        const data = caseStudySchema.parse(req.body);

        // Sanitize content
        if (data.content) {
            data.content = sanitizeHtml(data.content);
        }

        const study = await prisma.caseStudy.create({
            data: {
                ...data,
                authorId: req.user.id
            }
        });
        res.status(201).json(study);
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
        if (error.code === 'P2002') return res.status(400).json({ error: 'Slug must be unique' });
        res.status(500).json({ error: 'Internal server error' });
    }
};

const updateCaseStudy = async (req, res) => {
    const { id } = req.params;
    try {
        const data = caseStudySchema.partial().parse(req.body);
        if (data.content) {
            data.content = sanitizeHtml(data.content);
        }

        const study = await prisma.caseStudy.update({
            where: { id: parseInt(id) },
            data
        });
        res.json(study);
    } catch (error) {
        if (error.code === 'P2025') return res.status(404).json({ error: 'Not found' });
        res.status(500).json({ error: 'Internal server error' });
    }
};

const deleteCaseStudy = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.caseStudy.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'Deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Error' });
    }
};

module.exports = { getAllCaseStudies, getCaseStudyBySlug, createCaseStudy, updateCaseStudy, deleteCaseStudy };
