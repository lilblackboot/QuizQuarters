import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import io from "socket.io-client";

function Room() {
  const { id: roomId } = useParams();
  const [searchParams] = useSearchParams();
  const username = searchParams.get("username");
  const [question, setQuestion] = useState("");
  const [image, setImage] = useState(null);
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctOption, setCorrectOption] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [quizEnded, setQuizEnded] = useState(false);

  // Use a ref to persist socket instance
  const socketRef = useRef();

  // Example: Make the first user in the room the host
  const isHost = users.length > 0 && users[0].username === username;

  useEffect(() => {
    socketRef.current = io('http://localhost:5000');

    socketRef.current.emit("join-room", { username, roomId });

    socketRef.current.on("room-users", (userList) => {
      setUsers(userList);
    });

    socketRef.current.on("new-question", (qData) => {
      setCurrentQuestion(qData);
    });

    socketRef.current.on("quiz-ended", () => {
      setQuizEnded(true);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [username, roomId]);

  useEffect(() => {
    if (!socketRef.current) return;
    const handler = ({ leaderboard, totalPlayers }) => {
      setLeaderboard(leaderboard);
      setTotalPlayers(totalPlayers);
    };
    socketRef.current.on("update-leaderboard", handler);

    return () => {
      socketRef.current.off("update-leaderboard", handler);
    };
  }, []);

  const handleSendQuestion = () => {
    const qData = {
      question,
      options,
      correctOption,
      roomId,
      image: image ? URL.createObjectURL(image) : null // temp for testing
    };

    socketRef.current.emit("send-question", qData);
    setCurrentQuestion(qData);
  };

  const handleAnswer = (index) => {
    if (hasAnswered || isHost) return;

    setSelectedOption(index);
    setHasAnswered(true);

    socketRef.current.emit("submit-answer", {
      roomId,
      selected: index,
      correct: currentQuestion.correctOption,
      username,
    });
  };

  const handleNextQuestion = () => {
    setQuestion("");
    setImage(null);
    setOptions(["", "", "", ""]);
    setCorrectOption(0);
    setCurrentQuestion(null);
    setSelectedOption(null);
    setHasAnswered(false);

    // Optional: notify others that next question is coming
    socketRef.current.emit("next-question", { roomId });
  };

  const handleEndQuiz = () => {
    socketRef.current.emit("end-quiz", { roomId });
  };

  return (
    <div className="flex">
      {quizEnded && (
        <div className="text-center mt-6 text-xl text-green-600">
          🎉 Quiz Ended! Thanks for playing.
        </div>
      )}

      <div>
        <div className="p-10">
          <h1 className="text-xl font-bold mb-2">Room: {roomId}</h1>
          <h2 className="mb-4">Logged in as: {username}</h2>

          <h3 className="text-lg font-semibold">Users in Room:</h3>
          <ul>
            {users.map((u) => (
              <li key={u.id} className="text-blue-600">{u.username}</li>
            ))}
          </ul>
        </div>
        <div className="bg-white p-4 rounded shadow mt-6 w-full max-w-md">
          <h2 className="font-bold text-lg mb-2">🏆 Leaderboard</h2>
          <p className="mb-2">Total Players: {totalPlayers}</p>
          <ol>
            {leaderboard.map((entry, index) => (
              <li key={index}>
                {index + 1}. {entry.user} — {entry.score} point{entry.score !== 1 ? "s" : ""}
              </li>
            ))}
          </ol>
        </div>
      </div>
      {isHost && (
        <div className="bg-white p-4 rounded shadow w-full max-w-md">
          <h2 className="font-bold text-lg mb-2">Create a Question</h2>
          <input
            type="text"
            placeholder="Enter question"
            className="border p-2 mb-2 w-full"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <input
            type="file"
            onChange={(e) => setImage(e.target.files[0])}
            className="mb-2"
          />
          {[0, 1, 2, 3].map((i) => (
            <input
              key={i}
              type="text"
              placeholder={`Option ${i + 1}`}
              className="border p-2 mb-2 w-full"
              value={options[i]}
              onChange={(e) =>
                setOptions((prev) => {
                  const updated = [...prev];
                  updated[i] = e.target.value;
                  return updated;
                })
              }
            />
          ))}
          <select
            className="border p-2 mb-2 w-full"
            value={correctOption}
            onChange={(e) => setCorrectOption(Number(e.target.value))}
          >
            {[0, 1, 2, 3].map((i) => (
              <option key={i} value={i}>
                Correct: Option {i + 1}
              </option>
            ))}
          </select>
          <button
            onClick={handleSendQuestion}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Send Question
          </button>
        </div>
      )}
      {isHost && currentQuestion && (
        <button
          onClick={handleNextQuestion}
          className="mt-4 bg-purple-600 text-white px-4 py-2 rounded"
        >
          Next Question
        </button>
      )}
      {isHost && (
        <button
          onClick={handleEndQuiz}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded"
        >
          End Quiz
        </button>
      )}

      {currentQuestion && (
        <div className="bg-gray-100 p-4 rounded mt-4 w-full max-w-xl">
          <h2 className="text-xl font-semibold mb-2">{currentQuestion.question}</h2>
          {currentQuestion.image && (
            <img src={currentQuestion.image} className="mb-4 max-w-full rounded" />
          )}
          <ul className="space-y-2">
            {currentQuestion.options.map((opt, i) => (
              <li
                key={i}
                className={`p-2 border rounded cursor-pointer ${
                  selectedOption === i ? "bg-blue-300" : "bg-white"
                }`}
                onClick={() => handleAnswer(i)}
              >
                {opt}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Room;
