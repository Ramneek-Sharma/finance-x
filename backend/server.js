// backend/server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// HTTP CORS (dev-friendly)
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const allowed = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173'
    ];
    if (allowed.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200
}));
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/financex')
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Routes (keep your existing ones)
const authRoutes = require('./routes/auth');
const expenseRoutes = require('./routes/expenses');
const cityDataRoutes = require('./routes/CityData');

app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api', cityDataRoutes);

// Root
app.get('/', (req, res) => {
  res.status(200).json({
    message: '🚀 Finance X API is running successfully!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      expenses: '/api/expenses',
      cityData: '/api/city-data/:city/:bracket',
      intelligenceScore: '/api/intelligence/score'
    }
  });
});

// Error/404 handlers
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Create HTTP server and attach Socket.IO
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');

const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173'
    ],
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling'] // prefer ws; allow fallback
});

// --- Leaderboard (Mongo-backed, scores blank for now) ---
const User = require('./models/User');

function normCity(s) {
  return (s || '').trim().toLowerCase();
}

// Room name pattern: `${type}:${type==='city' ? city : 'all'}`
const roomKey = ({ city, type }) => `${type}:${type === 'city' ? (normCity(city) || 'unknown') : 'all'}`;

// Cache per room: { entries, lastHash, timer, lastLoadAt }
const roomState = new Map();

function hashEntries(entries) {
  // Stable hash across updates (score is empty for now)
  return JSON.stringify(entries.map(e => [e.userId, e.rank, e.name, e.city]));
}

function mapUsersToRows(users, room) {
  const rows = users
    .map(u => ({
      id: String(u._id),
      name: u.profile?.name || (u.email ? u.email.split('@')[0] : 'User'),
      city: normCity(u.profile?.city),
    }))
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    .slice(0, 20)
    .map((u, idx) => ({
      userId: u.id,
      name: u.name,
      city: u.city,
      score: '', // left blank as requested
      rank: idx + 1,
      streak: 0,
      achievements: [],
      room,
    }));

  if (rows.length > 0) return rows;

  // Fallback demo rows so UI isn't empty
  const demo = [
    { userId: 'u1', name: 'Ava',  city: 'demo', score: '', rank: 1, streak: 0, achievements: [] },
    { userId: 'u2', name: 'Ben',  city: 'demo', score: '', rank: 2, streak: 0, achievements: [] },
    { userId: 'u3', name: 'Cleo', city: 'demo', score: '', rank: 3, streak: 0, achievements: [] },
    { userId: 'u4', name: 'Dee',  city: 'demo', score: '', rank: 4, streak: 0, achievements: [] },
    { userId: 'u5', name: 'Eli',  city: 'demo', score: '', rank: 5, streak: 0, achievements: [] },
  ];
  return demo.map(e => ({ ...e, room }));
}

async function loadRoomEntries(room) {
  const [type, suffix] = room.split(':');
  let query = {};
  if (type === 'city' && suffix && suffix !== 'unknown') {
    query = { 'profile.city': new RegExp(`^${suffix}$`, 'i') };
  }
  const users = await User.find(query).select({ email: 1, profile: 1 }).lean();
  return mapUsersToRows(users, room);
}

async function ensureRoom(room) {
  let state = roomState.get(room);
  const now = Date.now();

  if (!state) {
    const entries = await loadRoomEntries(room);
    state = { entries, lastHash: hashEntries(entries), timer: null, lastLoadAt: now };
    roomState.set(room, state);
  } else if (!state.lastLoadAt || now - state.lastLoadAt > 60_000) {
    // refresh from DB every 60s
    const entries = await loadRoomEntries(room);
    state.entries = entries;
    state.lastHash = hashEntries(entries);
    state.lastLoadAt = now;
  }
  return state;
}

async function emitLeaderboard(room) {
  const state = await ensureRoom(room);
  io.to(room).emit('leaderboard-update', {
    room,
    updatedAt: new Date().toISOString(),
    entries: state.entries // guaranteed non-empty
  });
}

function startRoomTicker(room) {
  const state = roomState.get(room);
  if (state?.timer) return;

  const timer = setInterval(async () => {
    const s = await ensureRoom(room); // refresh inside ensureRoom every 60s
    const newHash = hashEntries(s.entries);
    if (newHash !== s.lastHash) {
      s.lastHash = newHash;
      emitLeaderboard(room);
    } else {
      // still emit periodically to keep UI fresh
      emitLeaderboard(room);
    }
  }, 10_000);

  if (state) state.timer = timer;
  else roomState.set(room, { entries: [], lastHash: '', timer, lastLoadAt: 0 });
}

// Socket handlers
io.on('connection', (socket) => {
  console.log('🔌 socket connected', socket.id);

  // Client emits: join-leaderboard { city, type: 'city' | 'global' }
  socket.on('join-leaderboard', async ({ city, type }) => {
    const t = (type || 'city').toLowerCase();
    const newRoom = roomKey({ city, type: t });

    // Leave prior rooms (except private room)
    for (const r of socket.rooms) {
      if (r !== socket.id && r !== newRoom) socket.leave(r);
    }
    socket.join(newRoom);

    await ensureRoom(newRoom);
    startRoomTicker(newRoom);
    await emitLeaderboard(newRoom); // immediate, non-empty

    // Optional personal score-update placeholder
    socket.emit('score-update', {
      userId: 'current-user',
      score: '',
      rank: '',
      streak: 0
    });
  });

  socket.on('disconnect', () => {
    // Optional: clean timers when rooms empty
    // for (const [room, state] of roomState) {
    //   const size = io.sockets.adapter.rooms.get(room)?.size || 0;
    //   if (size === 0 && state.timer) { clearInterval(state.timer); state.timer = null; }
    // }
  });
});

// Start combined server
const PORT = process.env.PORT || 5001; // use 5001 to match your current client
server.listen(PORT, () => {
  console.log(`🌟 Finance X Server running on port ${PORT}`);
  console.log(`📱 Frontend should connect to: http://localhost:${PORT}`);
});
