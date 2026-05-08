import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";

const ExercisesPage = () => {
  const [exercises, setExercises] = useState([]);
  const [openCategory, setOpenCategory] = useState(null);

  useEffect(() => {
    fetch("http://localhost:4000/api/exercises")
      .then((res) => res.json())
      .then((data) => {
        // Перевірка чи дані є масивом, щоб уникнути помилок .filter
        if (Array.isArray(data)) {
          const parentsExercises = data.filter((ex) => ex.role === "parents");
          setExercises(parentsExercises);
        }
      })
      .catch((err) => console.error("Помилка завантаження:", err));
  }, []);

  const categories = [...new Set(exercises.flatMap((ex) => ex.tags))];

  return (
    <div className="min-h-screen flex flex-col bg-[#f3f0e8]">
      {/* Навбар зверху */}
      <Navbar />

      {/* Основний контент */}
      <main className="flex-grow mt-20">
        <div className="py-12 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            {/* Header Section */}
            <header className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#354024] mt-3 mb-6">
                Практики для батьків
              </h1>
              <div className="w-20 h-1 bg-[#354024] mx-auto opacity-20"></div>
            </header>

            {/* Categories List */}
            <div className="space-y-6">
              {categories.map((cat) => (
                <div key={cat} className="group">
                  <button
                    onClick={() =>
                      setOpenCategory(openCategory === cat ? null : cat)
                    }
                    className={`w-full flex items-center justify-between px-8 py-6 rounded-2xl transition-all duration-300 border border-[#354024]/10 
                      ${openCategory === cat ? "bg-[#354024] text-[#f3f0e8] shadow-xl" : "bg-[#B7C1A8] text-[#354024] hover:bg-[#354024]/5"}`}
                  >
                    <span className="text-xl font-semibold tracking-tight">
                      {cat}
                    </span>
                    <div
                      className={`p-2 rounded-full border transition-transform duration-500 ${openCategory === cat ? "border-[#f3f0e8]/30 rotate-180" : "border-[#354024]/20"}`}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </button>

                  {/* Grid of Exercises */}
                  <div
                    className={`grid transition-all duration-500 ease-in-out overflow-hidden ${openCategory === cat ? "max-h-[5000px] opacity-100 mt-8" : "max-h-0 opacity-0"}`}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-8">
                      {exercises
                        .filter((ex) => ex.tags.includes(cat))
                        .map((ex) => (
                          <ExerciseCard key={ex._id} exercise={ex} />
                        ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Окремий компонент для "красивої вправи"
const ExerciseCard = ({ exercise }) => {
  const navigate = useNavigate();

  const handleReadMore = () => {
    navigate(`/exercises/${exercise._id}`);
  };

  return (
    <div className="group h-full">
      <div className="bg-[#B7C1A8] rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full border border-gray-100 pt-2">
        {/* Контейнер картинки як у статтях */}
        <div className="overflow-hidden flex items-center justify-center h-64 relative">
          {exercise.image ? (
            <img
              src={assets[exercise.image] || exercise.image}
              alt={exercise.title}
              className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500 p-4"
            />
          ) : (
            <div className="w-full h-full bg-[#354024]/5 flex items-center justify-center">
              <span className="text-[#354024]/20 font-serif italic text-2xl text-center px-4">
                {exercise.title}
              </span>
            </div>
          )}
        </div>

        {/* Контентна частина центрована як у статтях */}
        <div className="p-6 flex flex-col items-center text-center flex-1">
          <h3 className="text-xl font-bold text-gray-800 mb-3 min-h-[3.5rem] flex items-center justify-center leading-tight">
            {exercise.title}
          </h3>

          <p className="text-sm text-[#354024] text-center leading-relaxed mb-6 line-clamp-3">
            {exercise.shortDescription}
          </p>

          {/* Кнопка по центру */}
          <div className="mt-auto pt-2 w-full">
            <button
              onClick={handleReadMore}
              className="w-full sm:w-auto px-10 py-3 bg-[#354024] text-white font-medium rounded-full hover:bg-[#45542f] active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg text-sm uppercase tracking-widest"
            >
              До деталей
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExercisesPage;
