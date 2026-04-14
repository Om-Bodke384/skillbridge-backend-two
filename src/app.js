const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');

const authRoutes         = require('./modules/auth/auth.routes');
const userRoutes         = require('./modules/users/user.routes');
const communityRoutes    = require('./modules/community/community.routes');
const chatRoutes         = require('./modules/chat/chat.routes');
const townhallRoutes     = require('./modules/townhall/townhall.routes');
const hackathonRoutes    = require('./modules/hackathon/hackathon.routes');
const eventRoutes        = require('./modules/events/event.routes');
const announcementRoutes = require('./modules/announcements/announcement.routes');
const learningRoutes     = require('./modules/learning/learning.routes');
const peerReviewRoutes   = require('./modules/peer-review/peerReview.routes');
const peerMentorshipRoutes = require('./modules/peer-mentorship/peerMentorship.routes');
const adminRoutes        = require('./modules/admin/admin.routes');

const { errorHandler } = require('./common/middleware/error.middleware');
const { notFound }     = require('./common/middleware/notFound.middleware');

const app = express();

// ─── Security ────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many auth attempts, please try again later.' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ─── Body Parser ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Data Sanitization ───────────────────────────────────────────────────────
app.use(mongoSanitize());
app.use(hpp());

// ─── Compression & Logging ───────────────────────────────────────────────────
app.use(compression());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString(), env: process.env.NODE_ENV });
});


app.get('/', (req, res) => {
  res.status(200).json({ message: 'SkillBridge API is running' });
});


app.head('/', (req, res) => {
  res.status(200).end();
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',             authRoutes);
app.use('/api/users',            userRoutes);
app.use('/api/communities',      communityRoutes);
app.use('/api/chats',            chatRoutes);
app.use('/api/townhalls',        townhallRoutes);
app.use('/api/hackathons',       hackathonRoutes);
app.use('/api/events',           eventRoutes);
app.use('/api/announcements',    announcementRoutes);
app.use('/api/learning',         learningRoutes);
app.use('/api/peer-reviews',     peerReviewRoutes);
app.use('/api/peer-mentorship',  peerMentorshipRoutes);
app.use('/api/admin',            adminRoutes);

// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
