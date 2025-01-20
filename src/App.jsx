import "./App.css";
import { useEffect, useState, useCallback } from "react";

function App() {
  const [stringOfWords, setStringOfWords] = useState("");
  const [charsTyped, setCharsTyped] = useState(-1);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isTimerTicking, setIsTimerTicking] = useState(false);
  const [errors, setErrors] = useState(0);
  const [countdown, setCountdown] = useState(60);
  const [leaderboard, setLeaderboard] = useState([]);

  const clearInput = () => (document.getElementById("input").value = "");

  const handleKeyStroke = (event) => {
    const key = event.nativeEvent.data;
    if (key !== null) {
      if (charsTyped === -1) setTimeElapsed(0);
      setIsTimerTicking(true);
      if (key === stringOfWords[charsTyped + 1]) {
        setCharsTyped((charsTyped) => charsTyped + 1);
      } else {
        setErrors((errors) => errors + 1);
      }
      if (charsTyped + 2 === stringOfWords.length) setIsTimerTicking(false);
    }

    if (charsTyped + 1 === stringOfWords.length) {
      clearInput();
    }
  };

  const refreshWords = useCallback(() => {
    fetch(`https://random-word-api.herokuapp.com/word?number=20`)
      .then((res) => res.json())
      .then((data) => setStringOfWords(data.join(" ")));

    setCharsTyped(-1);
    clearInput();
    setIsTimerTicking(false);
  }, []);

  const renderWords = () => {
    const words = stringOfWords.split(" ");
    return words.map((word, index) => (
      <span
        key={index}
        className={`${
          index === Math.floor((charsTyped + 1) / word.length) ? "text-blue-500" : ""
        }`}
      >
        {word}{" "}
      </span>
    ));
  };

  const submitScore = () => {
    setLeaderboard((prev) =>
      [...prev, Math.round(((charsTyped + 1) / timeElapsed) * 12)].sort(
        (a, b) => b - a
      )
    );
    refreshWords();
  };

  useEffect(() => {
    refreshWords();
  }, [refreshWords]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isTimerTicking) {
        setTimeElapsed((timeElapsed) => timeElapsed + 1);
        setCountdown((countdown) => Math.max(countdown - 1, 0));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerTicking]);

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-800">
      {/* Sidebar */}
      <div className="w-1/4 bg-white shadow-lg p-4 border-r">
        <h2 className="text-xl font-bold mb-4">Leaderboard</h2>
        <ol className="list-decimal list-inside">
          {leaderboard.map((score, index) => (
            <li key={index}>{score} WPM</li>
          ))}
        </ol>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-10">
        <h1 className="text-4xl font-bold mb-4">Typing Speed Tester</h1>

        <div className="w-full max-w-4xl mb-4">
          <div className="bg-white border border-gray-300 rounded p-4 shadow-md text-center">
            {renderWords()}
          </div>
        </div>

        <div className="flex flex-wrap gap-4 items-center mb-4">
          <button
            onClick={refreshWords}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            Refresh
          </button>
          <button
            onClick={submitScore}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
          >
            Submit Score
          </button>
        </div>

        <div className="text-lg mb-4">
          {timeElapsed === 0
            ? 0
            : Math.round(((charsTyped + 1) / timeElapsed) * 12)}{" "}
          WPM
        </div>
        <div className="text-lg mb-4">
          Accuracy:{" "}
          {charsTyped === -1
            ? "100%"
            : `${Math.max(
                0,
                100 - Math.round((errors / (charsTyped + 1)) * 100)
              )}%`}
        </div>
        <div className="w-full max-w-4xl bg-gray-200 rounded-full h-4 mb-4">
          <div
            className="bg-blue-500 h-4 rounded-full"
            style={{
              width: `${((charsTyped + 1) / stringOfWords.length) * 100}%`,
            }}
          ></div>
        </div>
        <div className="text-lg mb-4">Time Remaining: {countdown}s</div>

        <input
          id="input"
          onChange={(e) => handleKeyStroke(e)}
          className="border border-gray-300 rounded w-full max-w-4xl px-4 py-2 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="text"
        />
      </div>
    </div>
  );
}

export default App;
