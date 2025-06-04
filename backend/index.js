const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const allowedOrigins = [
  "https://quiz-quarters.vercel.app",
  "http://localhost:3000"
];

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST"]
}));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST']
  }
});


app.use(express.json());
app.get('/', (req, res) => res.send("Quiz Room Backend is running"));

const users = {}; // { socketId: { username, roomId } }
const scores = {}; // { roomId: { username: score } }

io.on('connection', (socket) => {
  console.log('New socket connected:', socket.id);

  socket.on('join-room', ({ username, roomId }) => {
    socket.join(roomId);
    users[socket.id] = { username, roomId };

    const roomUsers = Object.entries(users)
      .filter(([id, user]) => user.roomId === roomId)
      .map(([id, user]) => ({ id, username: user.username }));

    io.to(roomId).emit('room-users', roomUsers);

    console.log(`${username} joined room ${roomId}`);
  });

  socket.on("send-question", (qData) => {
    io.to(qData.roomId).emit("new-question", qData);
  });

  socket.on('disconnect', () => {
    const user = users[socket.id];
    if (user) {
      const { roomId } = user;
      delete users[socket.id];

      const roomUsers = Object.entries(users)
        .filter(([id, u]) => u.roomId === roomId)
        .map(([id, u]) => ({ id, username: u.username }));

      io.to(roomId).emit('room-users', roomUsers);
       if (roomUsers.length === 0) {
      delete scores[roomId];
    }
      console.log(`${user.username} left room ${roomId}`);
    }
  });

  socket.on("end-quiz", ({ roomId }) => {
    io.to(roomId).emit("quiz-ended");
  });

  socket.on("submit-answer", ({ roomId, selected, correct, username }) => {
    if (!scores[roomId]) scores[roomId] = {};
    if (!scores[roomId][username]) scores[roomId][username] = 0;

    if (selected === correct) {
      scores[roomId][username] += 1;
    }

    // Build leaderboard
    const leaderboard = Object.entries(scores[roomId])
      .map(([user, score]) => ({ user, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3); // top 3 only

    const totalPlayers = Object.keys(
      Object.fromEntries(
        Object.entries(users).filter(([_, u]) => u.roomId === roomId)
      )
    ).length;

    io.to(roomId).emit("update-leaderboard", { leaderboard, totalPlayers });
  });
});

const PORT = 5000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
