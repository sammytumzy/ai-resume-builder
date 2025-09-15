const express = require('express');
const multer = require('multer');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const resumeRoutes = require('./routes/resume');
const careerRoutes = require('./routes/career');

const app = express();
const PORT = process.env.PORT || 3000;

// Startup diagnostics (no secrets)
const provider = process.env.GROK_API_KEY
  ? 'GROK'
  : process.env.GROQ_API_KEY
    ? 'GROQ'
    : process.env.OPENAI_API_KEY
      ? 'OPENAI'
      : 'NONE';
console.log(`LLM provider: ${provider}${process.env.LLM_MODEL ? `, model: ${process.env.LLM_MODEL}` : ''}`);
const keyLen = (v) => (v ? String(v).length : 0);
console.log(
  `Key lengths → GROK:${keyLen(process.env.GROK_API_KEY)} ` +
  `GROQ:${keyLen(process.env.GROQ_API_KEY)} ` +
  `OPENAI:${keyLen(process.env.OPENAI_API_KEY)}`
);

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use(express.static('public'));

// Routes
app.use('/api/resume', resumeRoutes);
app.use('/api/career', careerRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`AI Resume Builder server running on port ${PORT}`);
});

