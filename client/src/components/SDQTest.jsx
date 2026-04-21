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
    const scores = { emotional: 0, conduct: 0, hyperactivity: 0, peer: 0, prosocial: 0 };
    testData.questions.forEach((q, idx) => {
      const val = answers[idx]; 
      let points = (val === 1) ? 1 : (q.reverse ? (val === 0 ? 2 : 0) : (val === 2 ? 2 : 0));
      scores[q.scale] += points;
    });
    const total = scores.emotional + scores.conduct + scores.hyperactivity + scores.peer;
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

  if (loading) return <div className="p-10 text-center font-bold text-indigo-500">Готуємо питання...</div>;
  if (!testData) return null;

  return (
    <div className="w-full max-w-4xl mx-auto p-8 bg-white rounded-3xl shadow-xl mt-10 border border-indigo-50">
      {!isFinished ? (
        <div className="flex flex-col items-center">
          <div className="w-full bg-gray-100 h-3 rounded-full mb-8">
            <div 
              className="bg-gradient-to-r from-indigo-400 to-indigo-600 h-3 rounded-full transition-all duration-500" 
              style={{ width: `${((currentIndex + 1) / testData.questions.length) * 100}%` }}
            ></div>
          </div>
          
          <p className="text-2xl font-bold text-gray-800 text-center mb-10">
            {testData.questions[currentIndex].text}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
            {["Невірно", "Частково", "Вірно"].map((label, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                className={`py-5 rounded-2xl font-bold border-2 transition-all ${
                  answers[currentIndex] === idx 
                    ? "bg-indigo-600 border-indigo-600 text-white scale-105" 
                    : "border-gray-100 text-gray-500 hover:border-indigo-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={answers[currentIndex] === undefined}
            className="mt-12 px-16 py-4 bg-[#354024] text-white rounded-full font-bold disabled:opacity-20 hover:brightness-110 active:scale-95"
          >
            {currentIndex + 1 === testData.questions.length ? "Готово!" : "Далі"}
          </button>
        </div>
      ) : (
        <div className="text-center py-10">
          <div className="text-6xl mb-6">🌈</div>
          <h2 className="text-3xl font-black text-indigo-900 mb-4">Ти молодець!</h2>
          <p className="text-gray-500 text-lg max-w-md mx-auto">
            Дякую за твої відповіді. Твій сад став ще красивішим, а Beaver тепер знає, як тобі допомогти!
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-10 px-12 py-4 bg-indigo-100 text-indigo-700 rounded-full font-bold hover:bg-indigo-200"
          >
            Повернутися до ігор
          </button>
        </div>
      )}
    </div>
  );
};

export default SDQTest;