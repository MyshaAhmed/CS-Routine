// // server.js
// require('dotenv').config();
// const express = require('express');
// const connectDB = require('./config/db');
// const cors = require('cors');

// const app = express();
// const PORT = process.env.PORT || 5000;

// // Connect to MongoDB
// connectDB();

// // Middleware
// app.use(cors()); // Updated to match typical React port
// app.use(express.json({ limit: '50mb' })); // Increased limit for larger batch data

// // Routes
// app.use('/api/batches', require('./routes/batches'));

// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// server.js
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
app.use(cors()); // Updated to match typical React port
// app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' })); // Increased limit for larger batch data

// Routes
app.use('/api/batches', require('./routes/batches'));
app.use('/api/teachers', require('./routes/teachers'));

app.listen(PORT, '0.0.0.0', () => {  // Bind to all interfaces
    console.log(`Server running on port ${PORT}`);
  });