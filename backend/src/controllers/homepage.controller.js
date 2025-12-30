const prisma = require('../config/prisma');

const getAllSections = async (req, res) => {
    try {
        const sections = await prisma.homepageContent.findMany();
        const result = {};
        sections.forEach(s => {
            // Parse content if it's a string (stored as JSON string in DB)
            let content = s.content;
            if (typeof content === 'string') {
                try {
                    content = JSON.parse(content);
                } catch (e) {
                    // Keep as string if parsing fails
                }
            }
            result[s.sectionKey] = content;
        });
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getSection = async (req, res) => {
    const { key } = req.params;
    const section = await prisma.homepageContent.findUnique({ where: { sectionKey: key } });
    if (!section) return res.json({ content: null }); // Return null instead of 404 for easier frontend handling
    res.json(section);
};

const updateSection = async (req, res) => {
    const { key } = req.params;
    // Content can be sent directly or wrapped in { content: ... }
    const content = req.body.content !== undefined ? req.body.content : req.body;

    try {
        // Convert to JSON string if it's an object/array for storage
        const contentToStore = typeof content === 'string' ? content : JSON.stringify(content);

        const section = await prisma.homepageContent.upsert({
            where: { sectionKey: key },
            update: { content: contentToStore },
            create: { sectionKey: key, content: contentToStore }
        });
        res.json(section);
    } catch (error) {
        console.error('Update section error:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};

module.exports = { getAllSections, getSection, updateSection };

