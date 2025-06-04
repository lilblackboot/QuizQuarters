import { useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

function App() {
  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to server:", socket.id);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return <div className="text-center p-10">Quiz App Client</div>;
}

export default App;
