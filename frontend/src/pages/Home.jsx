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
    <div className="flex flex-col items-center gap-4 mt-20">
      <input
        className="border p-2 rounded"
        placeholder="Your name"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        className="border p-2 rounded"
        placeholder="Room ID to join"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
      />

      <button onClick={handleCreateRoom} className="bg-green-500 px-4 py-2 text-white rounded">
        Create Room
      </button>

      <button onClick={handleJoinRoom} className="bg-blue-500 px-4 py-2 text-white rounded">
        Join Room
      </button>
    </div>
  );
}

export default Home;
