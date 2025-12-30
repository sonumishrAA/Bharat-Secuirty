const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

const JWT_SECRET = process.env.JWT_SECRET || 'bharat-security-client-secret';

const authenticateClient = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Authorization token required' });
        }

        const token = authHeader.split(' ')[1];

        try {
            const decoded = jwt.verify(token, JWT_SECRET);

            if (decoded.type !== 'client') {
                return res.status(403).json({ error: 'Invalid token type' });
            }

            const client = await prisma.client.findUnique({
                where: { id: decoded.id }
            });

            if (!client || !client.isActive) {
                return res.status(401).json({ error: 'Client account not active or found' });
            }

            req.client = client;
            next();
        } catch (err) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }
    } catch (error) {
        console.error('Client auth middleware error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { authenticateClient };
