require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');
const jobRoutes = require('./routes/jobRoutes');
const deviceSocket = require('./sockets/deviceSocket');
const Scheduler = require('./services/scheduler');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Store io instance for access in controllers
app.set('io', io);

// Connect to MongoDB
connectDB();

// Routes
app.use('/api', jobRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'ShadowWork Server Running' });
});

// Initialize scheduler
const scheduler = new Scheduler(io);
scheduler.startScheduler();

// Initialize WebSocket handlers
deviceSocket(io, scheduler);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});