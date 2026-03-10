const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');
const logger = require('./utils/logger');

const app = express();

// ─── Security Headers ────────────────────────────────────────────────────────
app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
            fontSrc: ["'self'", 'https://fonts.gstatic.com'],
            imgSrc: ["'self'", 'data:', 'https:'],
            scriptSrc: ["'self'"],
            connectSrc: ["'self'", 'https://api.razorpay.com'],
        },
    },
}));

// ─── CORS ────────────────────────────────────────────────────────────────────
const allowedOrigins = [
    process.env.CLIENT_URL || 'http://localhost:5173',
    process.env.CLIENT_URL_ALT || '',
    process.env.PROD_CLIENT_URL || '',
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        // Allow specific origins from environment variables
        // Allow any Vercel preview URL dynamically
        if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
            callback(null, true);
        } else {
            callback(new Error(`CORS: Origin ${origin} not allowed`));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// ─── Body Parsing & Compression ──────────────────────────────────────────────
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Request Logging ─────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined', {
        stream: { write: (message) => logger.info(message.trim()) },
        skip: (req) => req.url === '/health',
    }));
}

// ─── Static Files ────────────────────────────────────────────────────────────
const uploadsPath = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

// ─── Health Check ────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
        version: '2.0.0',
    });
});

// ─── API Routes ──────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/batches', require('./routes/batchRoutes'));
app.use('/api/quality', require('./routes/qualityRoutes'));
app.use('/api/shop', require('./routes/shopRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/monitoring', require('./routes/monitoringRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/auction', require('./routes/auctionRoutes'));
app.use('/api/logistics', require('./routes/logisticsRoutes'));
app.use('/api/certificates', require('./routes/certificateRoutes'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/esg', require('./routes/esgRoutes'));

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

    const statusCode = err.status || err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: process.env.NODE_ENV === 'production'
            ? (statusCode < 500 ? err.message : 'Internal Server Error')
            : err.message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    });
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use('*', (req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

module.exports = app;
