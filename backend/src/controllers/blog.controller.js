const prisma = require('../config/prisma');
const { z } = require('zod');
const { generateUniqueSlug } = require('../utils/slugify');

const blogPostSchema = z.object({
    title: z.string().min(1),
    slug: z.string().optional(),
    excerpt: z.string().optional(),
    content: z.string().min(1),
    contentJson: z.any().optional(),
    coverImageUrl: z.string().optional(),
    status: z.enum(['draft', 'published', 'archived']).optional(),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    metaKeywords: z.string().optional(),
    categoryIds: z.array(z.number()).optional(),
    tagIds: z.array(z.number()).optional()
});

const getAllPosts = async (req, res) => {
    try {
        const { status, category, tag, search, page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};
        if (status) where.status = status;
        if (search) {
            where.OR = [
                { title: { contains: search } },
                { excerpt: { contains: search } },
                { content: { contains: search } }
            ];
        }
        if (category) {
            where.categories = { some: { slug: category } };
        }
        if (tag) {
            where.tags = { some: { slug: tag } };
        }

        const [posts, total] = await Promise.all([
            prisma.blogPost.findMany({
                where,
                include: {
                    author: { select: { id: true, name: true, email: true } },
                    categories: true,
                    tags: true
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: parseInt(limit)
            }),
            prisma.blogPost.count({ where })
        ]);

        res.json({
            posts,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};

const getPostBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const post = await prisma.blogPost.findUnique({
            where: { slug },
            include: {
                author: { select: { id: true, name: true, email: true } },
                categories: true,
                tags: true
            }
        });

        if (!post) return res.status(404).json({ error: 'Post not found' });

        // Increment view count
        await prisma.blogPost.update({
            where: { id: post.id },
            data: { viewCount: { increment: 1 } }
        });

        res.json(post);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

const createPost = async (req, res) => {
    try {
        const { categoryIds, tagIds, ...data } = blogPostSchema.parse(req.body);
        const authorId = req.user.id;

        // Generate slug if not provided
        if (!data.slug) {
            data.slug = await generateUniqueSlug(data.title, async (slug) => {
                const existing = await prisma.blogPost.findUnique({ where: { slug } });
                return !!existing;
            });
        }

        const post = await prisma.blogPost.create({
            data: {
                ...data,
                authorId,
                categories: categoryIds ? { connect: categoryIds.map(id => ({ id })) } : undefined,
                tags: tagIds ? { connect: tagIds.map(id => ({ id })) } : undefined
            },
            include: {
                author: { select: { id: true, name: true, email: true } },
                categories: true,
                tags: true
            }
        });

        res.status(201).json(post);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Slug must be unique' });
        }
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};

const updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { categoryIds, tagIds, ...data } = blogPostSchema.partial().parse(req.body);

        const post = await prisma.blogPost.update({
            where: { id: parseInt(id) },
            data: {
                ...data,
                categories: categoryIds ? { set: categoryIds.map(id => ({ id })) } : undefined,
                tags: tagIds ? { set: tagIds.map(id => ({ id })) } : undefined
            },
            include: {
                author: { select: { id: true, name: true, email: true } },
                categories: true,
                tags: true
            }
        });

        res.json(post);
    } catch (error) {
        if (error.code === 'P2025') return res.status(404).json({ error: 'Post not found' });
        res.status(500).json({ error: 'Internal server error' });
    }
};

const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.blogPost.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'Post deleted' });
    } catch (error) {
        if (error.code === 'P2025') return res.status(404).json({ error: 'Post not found' });
        res.status(500).json({ error: 'Internal server error' });
    }
};

const publishPost = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await prisma.blogPost.update({
            where: { id: parseInt(id) },
            data: {
                status: 'published',
                isPublished: true,
                publishedAt: new Date()
            },
            include: {
                author: { select: { id: true, name: true, email: true } },
                categories: true,
                tags: true
            }
        });
        res.json(post);
    } catch (error) {
        if (error.code === 'P2025') return res.status(404).json({ error: 'Post not found' });
        res.status(500).json({ error: 'Internal server error' });
    }
};

const unpublishPost = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await prisma.blogPost.update({
            where: { id: parseInt(id) },
            data: {
                status: 'draft',
                isPublished: false
            },
            include: {
                author: { select: { id: true, name: true, email: true } },
                categories: true,
                tags: true
            }
        });
        res.json(post);
    } catch (error) {
        if (error.code === 'P2025') return res.status(404).json({ error: 'Post not found' });
        res.status(500).json({ error: 'Internal server error' });
    }
};

const duplicatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const originalPost = await prisma.blogPost.findUnique({
            where: { id: parseInt(id) },
            include: { categories: true, tags: true }
        });

        if (!originalPost) return res.status(404).json({ error: 'Post not found' });

        const newSlug = await generateUniqueSlug(originalPost.title, async (slug) => {
            const existing = await prisma.blogPost.findUnique({ where: { slug } });
            return !!existing;
        });

        const { id: _, createdAt, updatedAt, viewCount, publishedAt, ...postData } = originalPost;

        const duplicatedPost = await prisma.blogPost.create({
            data: {
                ...postData,
                title: `${originalPost.title} (Copy)`,
                slug: newSlug,
                status: 'draft',
                isPublished: false,
                publishedAt: null,
                viewCount: 0,
                authorId: req.user.id,
                categories: { connect: originalPost.categories.map(c => ({ id: c.id })) },
                tags: { connect: originalPost.tags.map(t => ({ id: t.id })) }
            },
            include: {
                author: { select: { id: true, name: true, email: true } },
                categories: true,
                tags: true
            }
        });

        res.status(201).json(duplicatedPost);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};

const autosavePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { content, contentJson, title } = req.body;

        const post = await prisma.blogPost.update({
            where: { id: parseInt(id) },
            data: {
                content: content || undefined,
                contentJson: contentJson || undefined,
                title: title || undefined
            }
        });

        res.json({ message: 'Auto-saved successfully', updatedAt: post.updatedAt });
    } catch (error) {
        if (error.code === 'P2025') return res.status(404).json({ error: 'Post not found' });
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getAllPosts,
    getPostBySlug,
    createPost,
    updatePost,
    deletePost,
    publishPost,
    unpublishPost,
    duplicatePost,
    autosavePost
};
