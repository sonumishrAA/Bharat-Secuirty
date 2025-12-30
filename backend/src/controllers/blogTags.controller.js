const prisma = require('../config/prisma');
const { z } = require('zod');
const { slugify } = require('../utils/slugify');

const tagSchema = z.object({
    name: z.string().min(1),
    slug: z.string().optional()
});

const getAllTags = async (req, res) => {
    try {
        const tags = await prisma.blogTag.findMany({
            include: {
                _count: {
                    select: { posts: true }
                }
            }
        });
        res.json(tags);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

const createTag = async (req, res) => {
    try {
        const data = tagSchema.parse(req.body);

        // Generate slug if not provided
        if (!data.slug) {
            data.slug = slugify(data.name);
        }

        const tag = await prisma.blogTag.create({ data });
        res.status(201).json(tag);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Tag name or slug must be unique' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};

const deleteTag = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.blogTag.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'Tag deleted' });
    } catch (error) {
        if (error.code === 'P2025') return res.status(404).json({ error: 'Tag not found' });
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getAllTags,
    createTag,
    deleteTag
};
