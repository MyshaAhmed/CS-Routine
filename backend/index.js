// server.js
require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({ origin: 'http://localhost:3000' })); // Updated to match typical React port
app.use(express.json({ limit: '50mb' })); // Increased limit for larger batch data

// Routes
app.use('/api/batches', require('./routes/batches'));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));