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
  const [timer, setTimer] = useState(10);

  
  const [copied, setCopied] = useState(false);

  const socketRef = useRef();

  const isHost = users.length > 0 && users[0].username === username;

  useEffect(() => {
    socketRef.current = io('http://localhost:5000');

    socketRef.current.emit("join-room", { username, roomId });

    socketRef.current.on("room-users", (userList) => {
      setUsers(userList);
    });

    socketRef.current.on("new-question", (qData) => {
      setCurrentQuestion(qData);
      setSelectedOption(null);
      setHasAnswered(false);
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

  useEffect(() => {
    if (!currentQuestion) return;

    setTimer(10); // reset timer
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentQuestion]);

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
    if (hasAnswered || isHost || timer === 0) return;

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

    socketRef.current.emit("next-question", { roomId });
  };

  const handleEndQuiz = () => {
    socketRef.current.emit("end-quiz", { roomId });
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center py-8 px-2 text-white">
      {quizEnded && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg shadow-lg p-8 text-center max-w-md w-full border border-gray-700">
            <h2 className="text-2xl font-bold text-green-400 mb-4">🎉 Quiz Ended!</h2>
            <p className="mb-6 text-gray-200">Thanks for playing.</p>
            <button
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
              onClick={() => window.location.href = "/"}
            >
              Back to Home
            </button>
          </div>
        </div>
      )}

      {/* Room ID and Timer are always visible */}
      <div className="w-full max-w-xl mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-lg font-semibold text-blue-400">
            ⏳ Time left: {currentQuestion ? `${timer}s` : "—"}
          </span>
          <span className="text-sm text-gray-400 flex items-center gap-2">
            Room:
            <span className="font-bold tracking-wider bg-gray-800 px-2 py-1 rounded select-all">{roomId}</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(roomId);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              className="ml-1 px-2 py-1 rounded bg-gray-700 hover:bg-blue-600 text-xs text-white font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label="Copy Room ID"
              tabIndex={0}
            >
              {copied ? "Copied!" : "Copy"}
              
              
              
              
            </button>
          </span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 w-full max-w-6xl">
        {/* Left Panel */}
        <div className="flex-1 space-y-6">
          <div className="bg-gray-900 rounded-xl shadow p-6 border border-gray-700">
            <h1 className="text-2xl font-bold mb-2 text-blue-400">Quiz Room</h1>
            <p className="mb-2 text-gray-300">Logged in as: <span className="font-semibold text-green-400">{username}</span></p>
            <h3 className="text-lg font-semibold mb-2 text-yellow-400">👥 Users in Room:</h3>
            <div className="flex flex-wrap gap-2">
              {users.map((u) => (
                <span
                  key={u.id}
                  className="bg-gray-800 text-white px-3 py-1 rounded-full flex items-center gap-1 border border-gray-700"
                >
                  <span role="img" aria-label="user">😊</span>{u.username}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl shadow p-6 border border-gray-700">
            <h2 className="font-bold text-lg mb-2 text-yellow-400">🏆 Leaderboard</h2>
            <p className="mb-2 text-gray-300">Total Players: <span className="font-semibold text-green-400">{totalPlayers}</span></p>
            <ol className="space-y-1">
              {leaderboard.map((entry, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="font-bold text-lg text-blue-400">{index + 1}.</span>
                  <span className="font-semibold text-white">{entry.user}</span>
                  <span className="text-gray-400">{entry.score} point{entry.score !== 1 ? "s" : ""}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 space-y-6">
          {isHost && (
            <div className="bg-gray-900 rounded-xl shadow p-6 mb-4 border border-gray-700">
              <h2 className="font-bold text-lg mb-4 text-green-400">Create a Question</h2>
              <input
                type="text"
                placeholder="Enter question"
                className="border border-gray-700 bg-black text-white rounded p-2 mb-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
              <input
                type="file"
                onChange={(e) => setImage(e.target.files[0])}
                className="mb-2 w-full text-white"
              />
              <div className="grid grid-cols-2 gap-2 mb-2">
                {[0, 1, 2, 3].map((i) => (
                  <input
                    key={i}
                    type="text"
                    placeholder={`Option ${i + 1}`}
                    className="border border-gray-700 bg-black text-white rounded p-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
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
              </div>
              <select
                className="border border-gray-700 bg-black text-white rounded p-2 mb-2 w-full focus:outline-none focus:ring-2 focus:ring-green-400"
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
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition w-full font-semibold"
              >
                Send Question
              </button>
            </div>
          )}

          {isHost && currentQuestion && (
            <button
              onClick={handleNextQuestion}
              className="w-full mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition font-semibold"
            >
              Next Question
            </button>
          )}
          {isHost && (
            <button
              onClick={handleEndQuiz}
              className="w-full mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition font-semibold"
            >
              End Quiz
            </button>
          )}

          {currentQuestion && (
            <div className="bg-gray-900 rounded-xl shadow p-6 mt-4 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-blue-400">{currentQuestion.question}</h2>
              {currentQuestion.image && (
                <img
                  src={currentQuestion.image}
                  alt="Question"
                  className="mb-4 max-w-full rounded shadow"
                />
              )}
              <ul className="space-y-4 mt-2">
                {currentQuestion.options.map((opt, i) => {
                  const isSelected = selectedOption === i;
                  const isCorrect = hasAnswered && i === currentQuestion.correctOption;
                  const isIncorrect = hasAnswered && isSelected && !isCorrect;

                  return (
                    <li
                      key={i}
                      tabIndex={0}
                      aria-label={`Option ${String.fromCharCode(65 + i)}: ${opt}`}
                      className={`
                        flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                        text-lg font-medium select-none outline-none
                        ${isCorrect
                          ? "bg-green-900 border-green-400 text-green-200"
                          : isIncorrect
                          ? "bg-red-900 border-red-400 text-red-200"
                          : isSelected
                          ? "bg-blue-900 border-blue-400 text-blue-200"
                          : "bg-black border-gray-700 text-white hover:bg-gray-800 hover:border-blue-500 focus:ring-2 focus:ring-blue-400"
                        }
                        shadow-sm
                      `}
                      onClick={() => handleAnswer(i)}
                      onKeyDown={e => (e.key === "Enter" || e.key === " ") && handleAnswer(i)}
                    >
                      <span
                        className={`
                          flex items-center justify-center w-10 h-10 rounded-full font-bold text-base
                          ${isCorrect
                            ? "bg-green-500 text-black"
                            : isIncorrect
                            ? "bg-red-500 text-black"
                            : isSelected
                            ? "bg-blue-500 text-black"
                            : "bg-gray-800 text-gray-300"
                          }
                          transition
                        `}
                      >
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="flex-1">{opt}</span>
                      {hasAnswered && isSelected && (
                        <span className="ml-2 text-2xl">
                          {isCorrect ? "✔️" : "❌"}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Room;
