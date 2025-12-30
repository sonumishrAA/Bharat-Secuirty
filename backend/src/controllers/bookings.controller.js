const prisma = require('../config/prisma');
const { z } = require('zod');
const { createClientWithPassword, generateReferenceCode } = require('./clientAuth.controller');
const { sendBookingConfirmation, sendAdminNewBookingAlert, sendStatusUpdate } = require('../utils/emailService');

// Public contact form schema
const bookingSchema = z.object({
    serviceId: z.string().optional(),
    name: z.string().min(2),
    email: z.string().email(),
    company: z.string().optional(),
    phone: z.string().optional(),
    priority: z.string().optional(),
    budget: z.string().optional(),
    projectScope: z.string().min(10),
    timeline: z.string().optional(),
    additionalInfo: z.string().optional()
});

// Update status schema
const statusSchema = z.object({
    status: z.enum(['new', 'contacted', 'in_progress', 'testing', 'report_ready', 'completed', 'cancelled']),
    note: z.string().optional()
});

// ==================== PUBLIC ====================

// Submit booking form -> Auto register client -> Create booking
const createBooking = async (req, res) => {
    try {
        const data = bookingSchema.parse(req.body);
        const file = req.file;

        // 1. Create or get client
        const { client, tempPassword, isNewClient } = await createClientWithPassword({
            name: data.name,
            email: data.email,
            company: data.company,
            phone: data.phone
        });

        // 2. Determine Service ID
        let serviceId = data.serviceId ? parseInt(data.serviceId) : undefined;
        let serviceType = 'GEN';

        if (serviceId) {
            const service = await prisma.service.findUnique({ where: { id: serviceId } });
            if (service) serviceType = service.slug.split('-')[0].toUpperCase();
        }

        // 3. Generate Reference Code
        const referenceCode = generateReferenceCode(serviceType);

        // 4. Create Booking
        const booking = await prisma.booking.create({
            data: {
                referenceCode,
                clientId: client.id,
                serviceId,
                priority: data.priority || 'medium',
                budget: data.budget,
                projectScope: data.projectScope,
                timeline: data.timeline,
                additionalInfo: data.additionalInfo,
                status: 'new'
            },
            include: { service: true }
        });

        // 5. Save File (BookingFile)
        let fileCount = 0;
        if (file) {
            fileCount = 1;
            await prisma.bookingFile.create({
                data: {
                    bookingId: booking.id,
                    fileName: file.filename,
                    originalName: file.originalname,
                    fileUrl: `/uploads/${file.filename}`,
                    fileType: file.mimetype,
                    fileSize: file.size,
                    uploadedBy: 'client'
                }
            });
        }

        // 6. Send Emails (Non-blocking)
        if (isNewClient) {
            sendBookingConfirmation(client, booking, tempPassword).catch(console.error);
        }
        sendAdminNewBookingAlert(booking, client).catch(console.error);

        res.status(201).json({
            message: 'Booking submitted successfully',
            referenceCode,
            isNewAccount: isNewClient
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        console.error('Create booking error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// ==================== ADMIN ====================

const getAllBookings = async (req, res) => {
    try {
        const bookings = await prisma.booking.findMany({
            include: {
                service: true,
                client: {
                    select: { name: true, email: true, company: true }
                },
                _count: { select: { messages: { where: { isRead: false, senderType: 'client' } } } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getBookingById = async (req, res) => {
    try {
        const booking = await prisma.booking.findUnique({
            where: { id: parseInt(req.params.id) },
            include: {
                service: true,
                client: true,
                files: true,
                messages: {
                    include: { attachments: true },
                    orderBy: { createdAt: 'asc' }
                }
            }
        });

        if (!booking) return res.status(404).json({ error: 'Booking not found' });
        res.json(booking);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

const updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, note } = statusSchema.parse(req.body);

        const booking = await prisma.booking.update({
            where: { id: parseInt(id) },
            data: { status },
            include: { client: true }
        });

        // Send email notification
        sendStatusUpdate(booking.client, booking, status, note).catch(console.error);

        res.json(booking);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};

// ==================== CLIENT PORTAL ====================

const getClientBookings = async (req, res) => {
    try {
        const bookings = await prisma.booking.findMany({
            where: { clientId: req.client.id },
            include: {
                service: true,
                _count: { select: { messages: { where: { isRead: false, senderType: 'admin' } } } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getClientBookingById = async (req, res) => {
    try {
        const booking = await prisma.booking.findFirst({
            where: {
                id: parseInt(req.params.id),
                clientId: req.client.id
            },
            include: {
                service: true,
                files: true,
                messages: {
                    include: { attachments: true },
                    orderBy: { createdAt: 'asc' }
                }
            }
        });

        if (!booking) return res.status(404).json({ error: 'Booking not found' });
        res.json(booking);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    createBooking,
    getAllBookings,
    getBookingById,
    updateBookingStatus,
    getClientBookings,
    getClientBookingById
};
