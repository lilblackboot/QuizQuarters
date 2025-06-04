import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

function Home() {
  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("");
  const navigate = useNavigate();

  const handleCreateRoom = () => {
    if (!username) return alert("Enter your username");
    const newRoomId = uuidv4();
    navigate(`/room/${newRoomId}?username=${username}&host=true`);
  };

  const handleJoinRoom = () => {
    if (!username || !roomId) return alert("Enter both username and room ID");
    navigate(`/room/${roomId}?username=${username}&host=false`);
  };

  return (
    
    
    
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-black via-gray-900 to-gray-800 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">🎯</span>
            <h1 className="text-4xl font-extrabold text-blue-400 tracking-tight drop-shadow-lg">
              QuizQuarters
            </h1>
          </div>
          <p className="text-gray-300 text-center text-lg font-medium">
            Welcome! Enter your name to create or join a quiz room.
          </p>
        </div>

        {/* Card */}
        <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-8 flex flex-col gap-8 animate-fade-in">
          {/* Username */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="username"
              className="text-gray-200 font-semibold mb-1"
            >
              Your Name
            </label>
            <input
              id="username"
              className="border border-gray-700 bg-black text-white rounded px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              placeholder="e.g. Alex"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              maxLength={20}
              aria-label="Your Name"
            />
          </div>

          {/* Join Room */}
          <div className="flex flex-col gap-1">
            <label htmlFor="roomId" className="text-gray-200 font-semibold mb-1">
              Room ID
            </label>
            <input
              id="roomId"
              className="border border-gray-700 bg-black text-white rounded px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
              placeholder="Paste a Room ID to join"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              maxLength={36}
              aria-label="Room ID"
            />
            <button
              onClick={handleJoinRoom}
              className="mt-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded px-4 py-2 w-full transition shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Join Room
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-2 my-2">
            <div className="flex-1 h-px bg-gray-700" />
            <span className="text-gray-500 text-xs uppercase tracking-widest">
              or
            </span>
            <div className="flex-1 h-px bg-gray-700" />
          </div>

          {/* Create Room */}
          <button
            onClick={handleCreateRoom}
            className="bg-green-500 hover:bg-green-600 text-white font-bold rounded px-4 py-2 w-full transition shadow focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            Create New Room
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-600 text-xs">
          <span>
            Made with{" "}
            <span className="text-red-400">♥</span> for quiz lovers.
          </span>
        </div>
      </div>
    </div>
  );
}

export default Home;
