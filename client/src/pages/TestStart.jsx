import React from "react";
import { useNavigate } from "react-router-dom";

const TestStart = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-4">PSDQ – Тест для батьків</h1>
      <p className="max-w-md text-center mb-6">
        Дізнайтеся свій стиль виховання дитини. Оцінюйте себе за шкалою 1–5: 1 —
        Ніколи; 5 — Завжди.
      </p>
      <button
        onClick={() => navigate("/test/questions")}
        className="px-6 py-3 bg-[#354024] text-white rounded-full hover:brightness-110"
      >
        Почати тест
      </button>
    </div>
  );
};

export default TestStart;
