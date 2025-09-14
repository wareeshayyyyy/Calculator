const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB Connection
mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

const auth = require('./auth');
const VideoProcessor = require('./video-processor');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://192.168.100.17:3000",
      "http://127.0.0.1:3000"
    ],
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://192.168.100.17:3000",
    "http://127.0.0.1:3000"
  ],
  credentials: true
}));
app.use(express.json());

// Routes
const streamRoutes = require('./routes/streams');
app.use('/api', streamRoutes);

// Video processor setup
const uploadDir = path.join(__dirname, '../uploads');
const videoProcessor = new VideoProcessor(uploadDir);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New connection details:', {
    id: socket.id,
    origin: socket.handshake.headers.origin,
    time: new Date().toISOString(),
    address: socket.handshake.address
  });

  // Keep track of roles
  const rooms = new Map();

  socket.on('join-room', (data) => {
    const { roomId, isHost, isViewer } = data;
    socket.join(roomId);
    
    if (isHost) {
      rooms.set(roomId, { hostId: socket.id });
      console.log(`Host ${socket.id} created room ${roomId}`);
    } else if (isViewer) {
      const roomData = rooms.get(roomId);
      if (roomData) {
        console.log(`Viewer ${socket.id} joined room ${roomId}`);
        socket.to(roomData.hostId).emit('user-joined', { userId: socket.id });
      }
    }
  });

  socket.on('offer', (data) => {
    console.log(`Offer from ${socket.id} to room ${data.target}`);
    socket.to(data.target).emit('offer', {
      offer: data.offer,
      sender: socket.id
    });
  });

  socket.on('answer', (data) => {
    console.log(`Answer from ${socket.id} to ${data.target}`);
    socket.to(data.target).emit('answer', {
      answer: data.answer,
      sender: socket.id
    });
  });

  socket.on('ice-candidate', (data) => {
    console.log(`ICE candidate from ${socket.id} to ${data.target}`);
    socket.to(data.target).emit('ice-candidate', {
      candidate: data.candidate,
      sender: socket.id
    });
  });
  
  // Handle live stream data for monitoring
  socket.on('live-stream-data', (data) => {
    console.log(`📡 Broadcasting live stream data from ${data.sessionId}`);
    
    // Broadcast to all monitoring clients
    socket.broadcast.emit('live-stream-data', {
      sessionId: data.sessionId,
      timestamp: data.timestamp,
      videoChunk: data.videoChunk,
      chunkIndex: data.chunkIndex,
      filename: data.filename,
      connectionId: data.sessionId
    });
  });

  socket.on('disconnect', (reason) => {
    console.log('Connection closed:', {
      id: socket.id,
      reason: reason,
      time: new Date().toISOString()
    });
    
    // Clean up rooms and notify participants
    rooms.forEach((value, roomId) => {
      if (value.hostId === socket.id) {
        // If host disconnected, notify viewers
        io.to(roomId).emit('host-left');
        rooms.delete(roomId);
      } else {
        // If viewer disconnected, notify host
        io.to(value.hostId).emit('viewer-left', { userId: socket.id });
      }
    });
  });
});

// Authentication routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await auth.register(username, password);
    res.json({ success: true, user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await auth.login(username, password);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

app.post('/api/auth/verify', auth.middleware, (req, res) => {
  res.json({ success: true, user: req.user });
});
// Ensure uploads directory exists
const uploadsDir = process.env.NODE_ENV === 'production' ? '/tmp/uploads' : './uploads';

app.use('/uploads', express.static(uploadsDir));
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    const connectionId = req.body.connectionId || 'unknown';
    const timestamp = Date.now();
    cb(null, `${connectionId}-${timestamp}.webm`);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/') || file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit per chunk
  }
});

// Routes
app.post('/api/connections', (req, res) => {
  const { connectionId, timestamp, userAgent } = req.body;
  console.log(`New connection: ${connectionId} at ${timestamp}`);
  
  // Store connection in database (implement based on your DB choice)
  res.json({ 
    success: true, 
    connectionId,
    message: 'Connection registered successfully' 
  });
});

app.post('/api/upload-chunk', upload.single('video'), (req, res) => {
  try {
    const { connectionId, timestamp, chunkIndex } = req.body;
    const videoChunk = req.file;
    
    if (!videoChunk) {
      return res.status(400).json({ error: 'No video chunk uploaded' });
    }
    
    console.log(`Received chunk ${chunkIndex} for connection ${connectionId}`);
    
    // Emit to connected clients about new chunk
    io.emit('chunkUploaded', {
      connectionId,
      filename: videoChunk.filename,
      size: videoChunk.size,
      timestamp,
      chunkIndex
    });
    
    res.json({ 
      success: true,
      filename: videoChunk.filename,
      size: videoChunk.size
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

app.post('/api/recordings', (req, res) => {
  const { connectionId, endTime, status, totalChunks } = req.body;
  console.log(`Recording ended for ${connectionId}: ${status}`);
  
  // Update recording status
  res.json({ 
    success: true,
    message: 'Recording status updated'
  });
});

// WebSocket handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join-room', (data) => {
    const { connectionId } = data;
    socket.join(connectionId);
    socket.to(connectionId).emit('user-connected', socket.id);
  });
  
  socket.on('offer', (data) => {
    socket.to(data.target).emit('offer', {
      offer: data.offer,
      sender: socket.id
    });
  });
  
  socket.on('answer', (data) => {
    socket.to(data.target).emit('answer', {
      answer: data.answer,
      sender: socket.id
    });
  });
  
  socket.on('ice-candidate', (data) => {
    socket.to(data.target).emit('ice-candidate', {
      candidate: data.candidate,
      sender: socket.id
    });
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});