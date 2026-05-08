import React, { useEffect, useState } from "react";
import axios from "axios";
import QuestionCard from "../components/QuestionCard";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const backendUrl = "http://localhost:4000"; // постав сюди свій бекенд

const TestQuestions = () => {
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/tests/psdq`);
        setTest(data);
      } catch (error) {
        console.error("Помилка завантаження тесту:", error);
      }
    };
    fetchTest();
  }, []);

  if (!test) return <p>Завантаження тесту...</p>;

  const question = test.questions[currentIndex];

  const handleAnswer = (value) => {
    setAnswers({ ...answers, [currentIndex]: value });
  };

  const handleNext = () => {
    if (currentIndex + 1 < test.questions.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // завершення тесту
      navigate("/test/result", { state: { test, answers } });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Навбар зверху */}
      <Navbar />
      <main className="flex-grow flex flex-col items-center justify-center p-4 mt-24">
        {/* Лічильник питань */}
        <div className="mb-6">
          <span className="bg-[#F3F0E8] text-[#354024] px-4 py-2 rounded-full font-semibold text-sm">
            Питання {currentIndex + 1} з {test.questions.length}
          </span>
        </div>

        {/* Прогрес-бар (опціонально, але додає краси) */}
        <div className="w-full max-w-xl bg-gray-200 h-1.5 rounded-full mb-8 overflow-hidden">
          <div
            className="bg-[#354024] h-full transition-all duration-300"
            style={{
              width: `${((currentIndex + 1) / test.questions.length) * 100}%`,
            }}
          ></div>
        </div>

        {/* Картка питання */}
        <div className="w-full max-w-2xl flex flex-col items-center text-center">
          <QuestionCard
            question={question}
            answer={answers[currentIndex]}
            setAnswer={handleAnswer}
          />

          {/* Кнопка "Далі" чітко по центру */}
          <button
            onClick={handleNext}
            className="mt-10 px-12 py-3 bg-[#354024] text-white font-medium rounded-full hover:bg-[#45542f] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
            disabled={answers[currentIndex] == null}
          >
            {currentIndex + 1 === test.questions.length
              ? "Закінчити тест"
              : "Наступне питання"}
          </button>
        </div>
      </main>
    </div>
  );
};

export default TestQuestions;
