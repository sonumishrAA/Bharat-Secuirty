const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'bharat-security-client-secret';
const JWT_EXPIRES = '7d';

// Generate random password
const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
    let password = '';
    for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
};

// Generate reference code
const generateReferenceCode = (serviceType = 'GEN') => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `SEC-${serviceType.toUpperCase().slice(0, 3)}-${timestamp}${random}`;
};

// Login schema
const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
});

// Register schema (internal use - auto-registration)
const registerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    company: z.string().optional(),
    phone: z.string().optional()
});

// Profile update schema
const profileSchema = z.object({
    name: z.string().min(2).optional(),
    company: z.string().optional(),
    phone: z.string().optional()
});

// Password change schema
const passwordChangeSchema = z.object({
    currentPassword: z.string().min(6),
    newPassword: z.string().min(8)
});

// Client Login
const login = async (req, res) => {
    try {
        const { email, password } = loginSchema.parse(req.body);

        const client = await prisma.client.findUnique({
            where: { email: email.toLowerCase() }
        });

        if (!client || !client.isActive) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const isValid = await bcrypt.compare(password, client.passwordHash);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Update last login
        await prisma.client.update({
            where: { id: client.id },
            data: { lastLoginAt: new Date() }
        });

        // Generate JWT
        const token = jwt.sign(
            { id: client.id, email: client.email, type: 'client' },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES }
        );

        res.json({
            token,
            client: {
                id: client.id,
                name: client.name,
                email: client.email,
                company: client.company
            }
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        console.error('Client login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Internal: Create client during booking (auto-registration)
const createClientWithPassword = async (data) => {
    const validated = registerSchema.parse(data);
    const tempPassword = generatePassword();
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    // Check if client exists
    let client = await prisma.client.findUnique({
        where: { email: validated.email.toLowerCase() }
    });

    let isNewClient = false;

    if (!client) {
        // Create new client
        client = await prisma.client.create({
            data: {
                email: validated.email.toLowerCase(),
                passwordHash,
                name: validated.name,
                company: validated.company,
                phone: validated.phone
            }
        });
        isNewClient = true;
    }

    return {
        client,
        tempPassword: isNewClient ? tempPassword : null,
        isNewClient
    };
};

// Get client profile
const getProfile = async (req, res) => {
    try {
        const client = await prisma.client.findUnique({
            where: { id: req.client.id },
            select: {
                id: true,
                name: true,
                email: true,
                company: true,
                phone: true,
                createdAt: true,
                lastLoginAt: true
            }
        });

        if (!client) {
            return res.status(404).json({ error: 'Client not found' });
        }

        res.json(client);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update client profile
const updateProfile = async (req, res) => {
    try {
        const data = profileSchema.parse(req.body);

        const client = await prisma.client.update({
            where: { id: req.client.id },
            data,
            select: {
                id: true,
                name: true,
                email: true,
                company: true,
                phone: true
            }
        });

        res.json(client);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Change password
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = passwordChangeSchema.parse(req.body);

        const client = await prisma.client.findUnique({
            where: { id: req.client.id }
        });

        const isValid = await bcrypt.compare(currentPassword, client.passwordHash);
        if (!isValid) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }

        const newHash = await bcrypt.hash(newPassword, 10);
        await prisma.client.update({
            where: { id: req.client.id },
            data: { passwordHash: newHash }
        });

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Forgot password - generate reset token
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const client = await prisma.client.findUnique({
            where: { email: email.toLowerCase() }
        });

        // Always return success (don't reveal if email exists)
        if (!client) {
            return res.json({ message: 'If the email exists, you will receive a reset link.' });
        }

        // Generate reset token (in production, store this and send email)
        const resetToken = crypto.randomBytes(32).toString('hex');

        // TODO: Store reset token in DB and send email
        // For now, just log it
        console.log(`Password reset requested for ${email}. Token: ${resetToken}`);

        res.json({ message: 'If the email exists, you will receive a reset link.' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    login,
    createClientWithPassword,
    generateReferenceCode,
    getProfile,
    updateProfile,
    changePassword,
    forgotPassword
};
