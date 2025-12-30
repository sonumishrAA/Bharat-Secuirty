const prisma = require('../config/prisma');
const { z } = require('zod');
const { slugify } = require('../utils/slugify');

const categorySchema = z.object({
    name: z.string().min(1),
    slug: z.string().optional(),
    description: z.string().optional(),
    color: z.string().optional(),
    order: z.number().int().default(0)
});

const getAllCategories = async (req, res) => {
    try {
        const categories = await prisma.blogCategory.findMany({
            orderBy: { order: 'asc' },
            include: {
                _count: {
                    select: { posts: true }
                }
            }
        });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

const createCategory = async (req, res) => {
    try {
        const data = categorySchema.parse(req.body);

        // Generate slug if not provided
        if (!data.slug) {
            data.slug = slugify(data.name);
        }

        const category = await prisma.blogCategory.create({ data });
        res.status(201).json(category);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Category name or slug must be unique' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};

const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const data = categorySchema.partial().parse(req.body);

        const category = await prisma.blogCategory.update({
            where: { id: parseInt(id) },
            data
        });

        res.json(category);
    } catch (error) {
        if (error.code === 'P2025') return res.status(404).json({ error: 'Category not found' });
        res.status(500).json({ error: 'Internal server error' });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.blogCategory.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'Category deleted' });
    } catch (error) {
        if (error.code === 'P2025') return res.status(404).json({ error: 'Category not found' });
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory
};
