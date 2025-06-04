const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // frontend dev port
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());
app.get('/', (req, res) => res.send("Quiz Room Backend is running"));

const users = {}; // { socketId: { username, roomId } }

io.on('connection', (socket) => {
  console.log('New socket connected:', socket.id);

  socket.on('join-room', ({ username, roomId }) => {
    socket.join(roomId); // Join the socket.io room
    users[socket.id] = { username, roomId };

    // Get users in this room
    const roomUsers = Object.entries(users)
      .filter(([id, user]) => user.roomId === roomId)
      .map(([id, user]) => ({ id, username: user.username }));

    // Notify all users in the room about the current user list
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
      console.log(`${user.username} left room ${roomId}`);
    }
  });
});

const PORT = 5000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
