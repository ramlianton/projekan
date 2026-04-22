// backend/src/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Jalankan WhatsApp Bot Service
require('./services/whatsappService');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const divisionRoutes = require('./routes/divisionRoutes'); // BARU
const reportRoutes = require('./routes/reportRoutes');     // BARU
const analyticsRoutes = require('./routes/analyticsRoutes');
const templateRoutes = require('./routes/templateRoutes'); // BARU
const projectRoutes = require('./routes/projectRoutes');   // BARU
const userRoutes = require('./routes/userRoutes');

const app = express();

app.use(cors()); 
app.use(express.json()); 

// --- ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/divisions', divisionRoutes); // BARU
app.use('/api/reports', reportRoutes);     // BARU
app.use('/api/analytics', analyticsRoutes); // BARU
app.use('/api/templates', templateRoutes); // BARU
app.use('/api/projects', projectRoutes);   // BARU
app.use('/api/users', userRoutes);

app.get('/api', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Welcome to API!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});