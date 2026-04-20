require('dotenv').config();
const express     = require('express');
const cors        = require('cors');
const helmet      = require('helmet');
const morgan      = require('morgan');
const rateLimit   = require('express-rate-limit');
const path        = require('path');
const logger      = require('./config/logger');
const errorMiddleware   = require('./middlewares/errorMiddleware');
const sanitizeMiddleware = require('./middlewares/sanitizeMiddleware');
const routes      = require('./routes');

const app = express();

// Security headers
app.use(helmet());

// CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['*'];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      cb(null, true);
    } else {
      cb(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Global rate limiter
const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES || '15', 10) * 60 * 1000,
  max:      parseInt(process.env.RATE_LIMIT_MAX_REQUESTS   || '200', 10),
  standardHeaders: true,
  legacyHeaders:   false,
  message: {success: false, message: 'Too many requests. Please try again later.'},
});
app.use(globalLimiter);

// HTTP logging
app.use(morgan('combined', {
  stream: {write: message => logger.http(message.trim())},
}));

// Body parsers
app.use(express.json({limit: '10mb'}));
app.use(express.urlencoded({extended: true, limit: '10mb'}));

// XSS sanitization — runs after body is parsed
app.use(sanitizeMiddleware);

// Static files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// API routes
app.use('/api', routes);

// 404
app.use((req, res) => {
  res.status(404).json({success: false, message: `Route ${req.method} ${req.url} not found`});
});

// Global error handler
app.use(errorMiddleware);

module.exports = app;
