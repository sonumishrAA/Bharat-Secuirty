const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors());
app.use(express.json());

// Static Uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/client/auth', require('./routes/clientAuth.routes'));
app.use('/api/services', require('./routes/services.routes'));
app.use('/api/bookings', require('./routes/bookings.routes'));
app.use('/api/messages', require('./routes/messages.routes'));
app.use('/api/case-studies', require('./routes/caseStudies.routes'));
app.use('/api/homepage', require('./routes/homepage.routes'));
app.use('/api/statistics', require('./routes/statistics.routes'));
app.use('/api/cms', require('./routes/cms.routes'));
app.use('/api/blog', require('./routes/blog.routes'));
app.use('/api/media', require('./routes/media.routes'));
app.use('/api/testimonials', require('./routes/testimonials.routes'));


// Basic Route
app.get('/', (req, res) => {
    res.json({ message: 'Bharat Security API is running' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
