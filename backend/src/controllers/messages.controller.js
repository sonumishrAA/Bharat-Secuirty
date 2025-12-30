const prisma = require('../config/prisma');
const { z } = require('zod');

// Message schema
const messageSchema = z.object({
    content: z.string().min(1)
});

// Send message (for both Client and Admin)
const sendMessage = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { content } = messageSchema.parse(req.body);
        const file = req.file;

        // Determine sender
        let senderType;
        let clientId = null;
        let adminId = null;

        if (req.client) {
            senderType = 'client';
            clientId = req.client.id;
        } else if (req.user) { // Admin middleware attaches 'user'
            senderType = 'admin';
            adminId = req.user.id;
        } else {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Verify booking access
        const booking = await prisma.booking.findUnique({
            where: { id: parseInt(bookingId) }
        });

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        // If client, verify ownership
        if (senderType === 'client' && booking.clientId !== clientId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Create message
        const message = await prisma.message.create({
            data: {
                bookingId: parseInt(bookingId),
                senderType,
                clientId,
                adminId,
                content
            }
        });

        // Handle attachment
        if (file) {
            await prisma.messageAttachment.create({
                data: {
                    messageId: message.id,
                    fileName: file.filename,
                    originalName: file.originalname,
                    fileUrl: `/uploads/${file.filename}`,
                    fileType: file.mimetype,
                    fileSize: file.size
                }
            });
        }

        // Return message with attachments
        const fullMessage = await prisma.message.findUnique({
            where: { id: message.id },
            include: { attachments: true }
        });

        res.status(201).json(fullMessage);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        console.error('Send message error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Mark messages as read
const markAsRead = async (req, res) => {
    try {
        const { bookingId } = req.params;

        // If client reading -> mark admin messages as read
        // If admin reading -> mark client messages as read
        const senderTypeToMark = req.client ? 'admin' : 'client';

        await prisma.message.updateMany({
            where: {
                bookingId: parseInt(bookingId),
                senderType: senderTypeToMark,
                isRead: false
            },
            data: {
                isRead: true,
                readAt: new Date()
            }
        });

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { sendMessage, markAsRead };
