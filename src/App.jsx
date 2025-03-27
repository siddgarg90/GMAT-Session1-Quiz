import "./index.css";
import React, { useState, useEffect } from "react";

export default function App() {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [questionTime, setQuestionTime] = useState(0);
  const [questionTimes, setQuestionTimes] = useState([]);
  const [timerRunning, setTimerRunning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    fetch(
      "https://opensheet.elk.sh/1s3YjqTPWm1GrWl3DcAwMn4NVjg8B2Uh8qBRFjPEwJk4/Sheet1"
    )
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((item) => ({
          description: item["Description"] || "",
          question: item["Question"] || "",
          options: {
            a: item["Option A"] || "",
            b: item["Option B"] || "",
            c: item["Option C"] || "",
            d: item["Option D"] || "",
            e: item["Option E"] || "",
          },
          correct: (item["Correct Answer"] || "").toLowerCase(),
          explanation:
            item["Explanations"] ||
            item["Explanation"] ||
            "No explanation provided.",
        }));
        setQuestions(formatted);
      });
  }, []);

  useEffect(() => {
    if (!timerRunning || isPaused) return;
    const timer = setInterval(() => setQuestionTime((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, [timerRunning, isPaused, currentIndex]);

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(
      2,
      "0"
    )}`;

  const current = questions[currentIndex];
  const selected = selectedOptions[currentIndex];
  const progress =
    questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  const handleSelect = (val) => {
    setSelectedOptions({ ...selectedOptions, [currentIndex]: val });
  };

  const handleSubmit = () => {
    if (!selected) return;
    setTimerRunning(false);
    setShowExplanation(true);
  };

  const handleNext = () => {
    setShowExplanation(false);
    setQuestionTimes([...questionTimes, questionTime]);
    setQuestionTime(0);
    setTimerRunning(true);
    setIsPaused(false);
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const handleRestart = () => {
    setSelectedOptions({});
    setCurrentIndex(0);
    setShowExplanation(false);
    setQuizFinished(false);
    setQuestionTimes([]);
    setQuestionTime(0);
    setTimerRunning(true);
    setIsPaused(false);
  };

  if (questions.length === 0)
    return <div className="p-6">Loading questions...</div>;

  if (quizFinished) {
    const score = questions.filter(
      (q, i) => selectedOptions[i] === q.correct
    ).length;
    const totalTime = questionTimes.reduce((a, b) => a + b, 0);

    return (
      <div className="p-6 max-w-2xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4">🎉 Quiz Complete</h2>
        <p className="text-xl mb-2">
          Score: {score} / {questions.length}
        </p>
        <p className="text-gray-600 mb-4">
          Total Time: {formatTime(totalTime)}
        </p>

        <div className="text-left max-w-md mx-auto mb-6">
          {questions.map((q, i) => (
            <div key={i} className="mb-2 border-b pb-2">
              <p className="font-semibold">Question {i + 1}</p>
              <p className="text-sm text-gray-600">
                Time Taken: {formatTime(questionTimes[i] || 0)}
              </p>
              <p
                className={
                  selectedOptions[i] === q.correct
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {selectedOptions[i]
                  ? selectedOptions[i] === q.correct
                    ? "✅ Correct"
                    : `❌ Incorrect (Correct: ${q.correct.toUpperCase()})`
                  : "Skipped"}
              </p>
            </div>
          ))}
        </div>

        <button
          onClick={handleRestart}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Restart Quiz
        </button>
      </div>
    );
  }

  return (
    <div className="relative p-6 max-w-3xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="text-sm text-gray-600 mb-1 font-medium">
          Question {currentIndex + 1} of {questions.length}
        </div>
        <div className="w-full bg-gray-300 h-2 rounded overflow-hidden">
          <div
            className="bg-blue-500 h-2"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Timer Box pinned to top right */}
      <div className="absolute top-0 right-0 m-4 space-y-2 text-right z-10">
        <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded shadow-md font-semibold text-sm">
          ⏱ {formatTime(questionTime)}
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white p-4 rounded shadow space-y-4">
        <p className="italic text-gray-700">{current.description}</p>
        <p className="font-medium text-gray-900">{current.question}</p>

        <div className="space-y-2">
          {Object.entries(current.options).map(
            ([key, val]) =>
              val && (
                <div
                  key={key}
                  className="flex items-start space-x-2 bg-gray-50 p-2 rounded border hover:bg-gray-100"
                >
                  <input
                    type="radio"
                    name={`question-${currentIndex}`}
                    value={key}
                    checked={selected === key}
                    onChange={() => handleSelect(key)}
                    className="mt-1"
                  />
                  <label className="cursor-pointer text-gray-800">
                    <strong>{key.toUpperCase()}.</strong> {val}
                  </label>
                </div>
              )
          )}
        </div>

        {showExplanation && (
          <div className="p-3 bg-gray-100 border rounded text-sm">
            {selected === current.correct ? (
              <p className="text-green-600 font-semibold">✅ Correct!</p>
            ) : (
              <p className="text-red-600 font-semibold">
                ❌ Incorrect. Correct: {current.correct.toUpperCase()}
              </p>
            )}
            <p className="mt-1">
              <strong>Explanation:</strong> {current.explanation}
            </p>
          </div>
        )}

        <div className="flex gap-2 pt-6 flex-wrap">
          {!showExplanation ? (
            <>
              <button
                onClick={handleSubmit}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Submit
              </button>
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
              >
                {isPaused ? "Resume Timer" : "Pause Timer"}
              </button>
              <button
                onClick={handleNext}
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
              >
                Skip
              </button>
            </>
          ) : (
            <button
              onClick={handleNext}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              {currentIndex + 1 === questions.length ? "Finish" : "Next"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
