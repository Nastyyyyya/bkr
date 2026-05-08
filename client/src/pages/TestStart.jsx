import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar"; // Імпортуємо ваш навбар

const TestStart = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Навбар зверху */}
      <Navbar />

      {/* Основний контент */}
      <main className="flex-grow flex items-center justify-center p-6">
        {/* Контейнер з контентом */}
        <div className="max-w-2xl w-full bg-[#F3F0E8] p-10 md:p-20 rounded-[40px] shadow-sm text-center border border-gray-100 transition-all">
          <h1 className="text-3xl md:text-5xl font-bold mb-8 text-[#2d3422] leading-tight">
            PSDQ – Тест для батьків
          </h1>

          <p className="text-center text-lg md:text-xl text-gray-700 mb-10 leading-relaxed">
            Дізнайтеся свій стиль виховання дитини.{" "}
            <br className="hidden md:block" />
            Оцінюйте свою поведінку за шкалою від 1 до 5:
          </p>

          {/* Легенда шкали */}
          <div className="flex justify-center gap-8 mb-12 text-sm md:text-base">
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold text-[#354024]">1</span>
              <span className="text-gray-500 mt-1 uppercase tracking-wider">
                Ніколи
              </span>
            </div>
            <div className="h-12 w-[1px] bg-gray-300"></div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold text-[#354024]">5</span>
              <span className="text-gray-500 mt-1 uppercase tracking-wider">
                Завжди
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate("/test/questions")}
            className="px-16 py-4 bg-[#354024] text-white text-xl font-medium rounded-full hover:bg-[#45542f] active:scale-95 transition-all duration-200 shadow-lg shadow-[#354024]/20"
          >
            Почати тест
          </button>
        </div>
      </main>
    </div>
  );
};

export default TestStart;
