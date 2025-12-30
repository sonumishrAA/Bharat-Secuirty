const prisma = require('../config/prisma');
const path = require('path');
const fs = require('fs');

const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const file = req.file;
        const userId = req.user.id;

        // Determine media type from mime type
        let mediaType = 'other';
        if (file.mimetype.startsWith('image/')) mediaType = 'image';
        else if (file.mimetype.startsWith('video/')) mediaType = 'video';
        else if (file.mimetype.includes('pdf') || file.mimetype.includes('document')) mediaType = 'document';

        // For images, we could extract dimensions here (would need sharp library)
        // For now, we'll set them as null

        const media = await prisma.media.create({
            data: {
                fileName: file.filename,
                originalName: file.originalname,
                fileUrl: `/uploads/${file.filename}`,
                fileType: mediaType,
                mimeType: file.mimetype,
                fileSize: file.size,
                uploadedBy: userId
            }
        });

        res.status(201).json(media);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};

const getAllMedia = async (req, res) => {
    try {
        const { type, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = type ? { fileType: type } : {};

        const [media, total] = await Promise.all([
            prisma.media.findMany({
                where,
                include: {
                    uploader: {
                        select: { id: true, name: true, email: true }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: parseInt(limit)
            }),
            prisma.media.count({ where })
        ]);

        res.json({
            media,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getMediaById = async (req, res) => {
    try {
        const { id } = req.params;
        const media = await prisma.media.findUnique({
            where: { id: parseInt(id) },
            include: {
                uploader: {
                    select: { id: true, name: true, email: true }
                }
            }
        });

        if (!media) return res.status(404).json({ error: 'Media not found' });
        res.json(media);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

const updateMedia = async (req, res) => {
    try {
        const { id } = req.params;
        const { alt, width, height } = req.body;

        const media = await prisma.media.update({
            where: { id: parseInt(id) },
            data: {
                alt: alt !== undefined ? alt : undefined,
                width: width !== undefined ? parseInt(width) : undefined,
                height: height !== undefined ? parseInt(height) : undefined
            }
        });

        res.json(media);
    } catch (error) {
        if (error.code === 'P2025') return res.status(404).json({ error: 'Media not found' });
        res.status(500).json({ error: 'Internal server error' });
    }
};

const deleteMedia = async (req, res) => {
    try {
        const { id } = req.params;

        // Get media to delete the file from filesystem
        const media = await prisma.media.findUnique({
            where: { id: parseInt(id) }
        });

        if (!media) return res.status(404).json({ error: 'Media not found' });

        // Delete from database
        await prisma.media.delete({ where: { id: parseInt(id) } });

        // Delete file from filesystem
        const filePath = path.join(__dirname, '../../uploads', media.fileName);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        res.json({ message: 'Media deleted successfully' });
    } catch (error) {
        if (error.code === 'P2025') return res.status(404).json({ error: 'Media not found' });
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    uploadFile,
    getAllMedia,
    getMediaById,
    updateMedia,
    deleteMedia
};
