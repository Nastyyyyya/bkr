import React, { useEffect, useState } from "react";
import axios from "axios";

const SDQTest = ({ childId, backendUrl }) => {
  const [testData, setTestData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/sdq-test/get-test`);
        setTestData(data);
      } catch (error) {
        console.error("SDQ Error:", error);
      } finally {
        setLoading(false);
      }
    };
    if (childId) fetchTest();
  }, [backendUrl, childId]);

  const handleAnswer = (value) => {
    setAnswers({ ...answers, [currentIndex]: value });
  };

  const calculateFinalScores = () => {
    const scores = {
      emotional: 0,
      conduct: 0,
      hyperactivity: 0,
      peer: 0,
      prosocial: 0,
    };
    testData.questions.forEach((q, idx) => {
      const val = answers[idx];
      let points =
        val === 1 ? 1 : q.reverse ? (val === 0 ? 2 : 0) : val === 2 ? 2 : 0;
      scores[q.scale] += points;
    });
    const total =
      scores.emotional + scores.conduct + scores.hyperactivity + scores.peer;
    return { ...scores, total };
  };

  const handleNext = async () => {
    if (currentIndex + 1 < testData.questions.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      const results = calculateFinalScores();
      setIsFinished(true);
      try {
        await axios.post(`${backendUrl}/api/sdq-test/submit-result`, {
          childId,
          scores: results,
        });
      } catch (e) {
        console.error("Save Error:", e);
      }
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center p-20 text-[#2c4832]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#2c4832]/10 border-t-[#2c4832] mb-4"></div>
        <p className="font-black uppercase tracking-widest text-xs">
          Готуємо питання...
        </p>
      </div>
    );

  if (!testData) return null;

  const progress = ((currentIndex + 1) / testData.questions.length) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto bg-[#f8f9f5] p-8 sm:p-12 rounded-[40px] shadow-[0_20px_50px_rgba(44,72,50,0.08)] border border-white mt-10 select-none">
      {!isFinished ? (
        <div className="flex flex-col items-center">
          {/* Progress Bar */}
          <div className="w-full flex items-center gap-4 mb-12">
            <div className="flex-1 bg-white h-4 rounded-full overflow-hidden border border-[#2c4832]/5 shadow-inner">
              <div
                className="bg-[#2c4832] h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="text-[#2c4832] font-black text-xs tracking-tighter w-12 text-right">
              {Math.round(progress)}%
            </span>
          </div>

          {/* Question Box */}
          <div className="min-h-[160px] flex items-center justify-center w-full px-4 mb-12 bg-white rounded-[30px] border border-[#2c4832]/5 shadow-sm">
            <h3 className="text-xl sm:text-2xl font-black text-[#2c4832] text-center leading-snug">
              {testData.questions[currentIndex].text}
            </h3>
          </div>

          {/* Answer Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl">
            {["Невірно", "Частково", "Вірно"].map((label, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                className={`py-6 rounded-2xl font-black text-lg transition-all duration-300 border-2 ${
                  answers[currentIndex] === idx
                    ? "bg-[#2c4832] border-[#2c4832] text-white scale-105 shadow-xl"
                    : "bg-white border-transparent text-[#2c4832]/90 hover:border-[#2c4832]/20 hover:text-[#2c4832]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Navigation Button */}
          <button
            onClick={handleNext}
            disabled={answers[currentIndex] === undefined}
            className="mt-16 px-20 py-5 bg-[#2c4832] text-white rounded-full font-black text-xl uppercase tracking-widest shadow-[0_15px_30px_rgba(44,72,50,0.2)] disabled:opacity-30 disabled:grayscale hover:bg-[#1a2e20] active:scale-95 transition-all"
          >
            {currentIndex + 1 === testData.questions.length
              ? "Завершити"
              : "Далі →"}
          </button>

          <p className="mt-6 text-[#2c4832] text-[10px] font-black uppercase tracking-[0.2em]">
            Питання {currentIndex + 1} з {testData.questions.length}
          </p>
        </div>
      ) : (
        /* Success Screen */
        <div className="text-center py-12 flex flex-col items-center animate-in fade-in zoom-in duration-700">
          <h2 className="text-4xl font-black text-[#2c4832] mb-6 uppercase tracking-tight">
            Ти молодець!
          </h2>
          <p className="text-[#2c4832]/60 text-lg font-medium max-w-md mx-auto leading-relaxed px-4">
            Дякую за твої відповіді. Тепер ми краще розуміємо, як зробити твій
            шлях цікавішим та легшим!
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-12 px-14 py-5 bg-white text-[#2c4832] border-2 border-[#2c4832] rounded-full font-black text-lg hover:bg-[#2c4832] hover:text-white transition-all shadow-sm active:scale-95"
          >
            Повернутися до ігор
          </button>
        </div>
      )}
    </div>
  );
};

export default SDQTest;
