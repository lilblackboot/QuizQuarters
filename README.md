# Quiz Quarters 🎯

**Live Demo:** [quiz-quarters.vercel.app](https://quiz-quarters.vercel.app)

A real-time multiplayer quiz game that allows users to join quiz rooms, answer questions, and compete for the top spot on the leaderboard — all in a smooth and interactive experience.

---

## 🚀 Tech Stack

| Tech | Usage |
|------|--------|
| **React.js** | Frontend framework |
| **Tailwind CSS** | Styling |
| **React Router** | Client-side routing |
| **Socket.IO** | Real-time WebSocket communication |
| **Node.js + Express** | Backend server |
| **Vercel** | Frontend hosting |
| **Render** | Backend hosting |
| **JavaScript (ES6+)** | Programming language used throughout |

---

## ✨ Features

- 🎮 Real-time quiz rooms using WebSockets
- 👥 Live user list per room
- 🧠 Hosts can create and send questions with options
- 📊 Dynamic leaderboard updates
- ⏳ Countdown timer for each question
- 🔒 Auto disconnection and user sync
- 📱 Fully responsive UI

---

## 🔧 Folder Structure

```
/client
  └── /src
      └── /pages
          └── Home.jsx
          └── Room.jsx         // Main quiz logic, UI & real-time interaction
      └── /App.jsx
      └── /index.js
/server
  └── index.js                // Socket.IO logic, room/user management
```

---

## 🧠 Logic Overview

### 🔌 Frontend Logic (Room.jsx)

- `useEffect` with `socket.emit("join-room", ...)`: Joins a room using a room ID and username.
- `handleSendQuestion()`: Allows the host to send a new question to all players in the room.
- `handleAnswer()`: Submits the selected option to the backend.
- `handleNextQuestion()`: Moves to the next question.
- `handleEndQuiz()`: Ends the quiz and displays a message.
- `useEffect` with `timer`: Manages the countdown for each question.

### 🔌 Backend Logic (index.js)

- `join-room`: Adds user to room and emits updated user list.
- `send-question`: Broadcasts a new question to all users in a room.
- `submit-answer`: Calculates scores and emits a dynamic leaderboard.
- `disconnect`: Removes user and updates room participants.
- `end-quiz`: Signals all users that the quiz has ended.

---

## 📦 Installation & Local Development

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/quiz-quarters.git
cd quiz-quarters
```

### 2. Run Backend

```bash
cd server
npm install
node index.js
```

### 3. Run Frontend

```bash
cd client
npm install
npm run dev
```

- Make sure your `Room.jsx` connects to `http://localhost:5000` when in dev mode.

---

## ⚙️ Environment Config

In `Room.jsx`, toggle between production and local backend:

```js
const socketRef = useRef();

useEffect(() => {
  socketRef.current = io(import.meta.env.MODE === 'development' ? 'http://localhost:5000' : 'https://quizquarters.onrender.com');
  // ...
}, []);
```

---

## 🤝 Contributing

1. Fork the repo 🍴
2. Create a branch: `git checkout -b feature-new-feature`
3. Commit: `git commit -m "Added something cool"`
4. Push: `git push origin feature-new-feature`
5. Submit a pull request ✅

---

## 📜 License

MIT License — feel free to fork and build upon this.
