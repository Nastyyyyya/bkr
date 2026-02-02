import React, { useEffect, useState } from "react";
import axios from "axios";
import QuestionCard from "../components/QuestionCard";
import { useNavigate } from "react-router-dom";

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
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h2 className="text-2xl font-semibold mb-4">
        Питання {currentIndex + 1} з {test.questions.length}
      </h2>

      <QuestionCard
        question={question}
        answer={answers[currentIndex]}
        setAnswer={handleAnswer}
      />

      <button
        onClick={handleNext}
        className="mt-4 px-6 py-2 bg-[#354024] text-white rounded-full hover:brightness-110"
        disabled={answers[currentIndex] == null}
      >
        {currentIndex + 1 === test.questions.length ? "Закінчити" : "Далі"}
      </button>
    </div>
  );
};

export default TestQuestions;
