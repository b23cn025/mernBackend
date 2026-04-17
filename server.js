require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Connect to MongoDB
connectDB();
const settingsRoutes  = require('./routes/settingsRoutes');
const profileRoutes   = require('./routes/profileRoutes');
const helpdeskRoutes  = require('./routes/helpdeskRoutes');

// Middleware
const corsOptions = {
  origin: ['http://localhost:5173', 'https://projectfitnesspass.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/exercises', require('./routes/exercises'));
app.use('/api/muscles',   require('./routes/muscles'));
app.use('/api/workouts',  require('./routes/workouts'));
app.use('/api/progress',  require('./routes/progress'));
app.use('/api/payments',  require('./routes/payments'));
app.use('/api/rewards',   require('./routes/rewards'));
app.use('/api/family',    require('./routes/family'));
app.use('/api/admin',     require('./routes/admin'));

// New routes
app.use('/api/users/settings', settingsRoutes);
app.use('/api/users/profile',  profileRoutes);
app.use('/api/helpdesk',       helpdeskRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'FitnessPass API is running!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 FitnessPass Server running on http://localhost:${PORT}`);
});