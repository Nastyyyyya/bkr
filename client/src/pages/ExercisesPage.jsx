import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const ExercisesPage = () => {
  const [exercises, setExercises] = useState([]);
  const [openCategory, setOpenCategory] = useState(null);

  useEffect(() => {
    fetch("http://localhost:4000/api/exercises")
      .then((res) => res.json())
      .then((data) => {
        const parentsExercises = data.filter((ex) => ex.role === "parents");
        setExercises(parentsExercises);
      });
  }, []);

  const categories = [...new Set(exercises.flatMap((ex) => ex.tags))];

  return (
    <div className="min-h-screen bg-[#f3f0e8] py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <header className="text-center mb-16">
          <span className="text-[#354024] font-medium tracking-widest uppercase text-sm">
            Ресурси для гармонії
          </span>
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
                  ${openCategory === cat ? "bg-[#354024] text-[#f3f0e8] shadow-xl" : "bg-white text-[#354024] hover:bg-[#354024]/5"}`}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
  );
};

// Окремий компонент для "красивої вправи"
const ExerciseCard = ({ exercise }) => {
  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-[#354024]/5 hover:shadow-2xl hover:shadow-[#354024]/10 transition-all duration-500 flex flex-col h-full">
      {/* Image Container */}
      <div className="relative h-64 overflow-hidden">
        {exercise.image ? (
          <img
            src={exercise.image}
            alt={exercise.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-[#354024]/10 flex items-center justify-center">
            <span className="text-[#354024]/30 font-serif italic text-4xl">
              Art
            </span>
          </div>
        )}
        <div className="absolute top-4 left-4">
          <span className="bg-[#f3f0e8]/90 backdrop-blur-sm text-[#354024] text-[10px] uppercase tracking-[0.2em] font-bold px-3 py-1 rounded-full shadow-sm">
            Exercise
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-8 flex flex-col flex-grow">
        <h3 className="text-2xl font-serif font-bold text-[#354024] mb-3 leading-tight transition-colors group-hover:text-[#354024]/80">
          {exercise.title}
        </h3>
        <p className="text-[#354024]/70 text-sm leading-relaxed mb-8 line-clamp-3 italic">
          "{exercise.shortDescription}"
        </p>

        <div className="mt-auto pt-6 border-t border-[#354024]/10 flex items-center justify-between">
          <Link
            to={`/exercises/${exercise._id}`}
            className="relative inline-block font-bold text-[#354024] text-sm uppercase tracking-widest group/link"
          >
            До деталей
            <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-[#354024] transition-all duration-300 group-hover/link:w-full"></span>
          </Link>
          <div className="w-8 h-8 rounded-full bg-[#f3f0e8] flex items-center justify-center text-[#354024] opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M14 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExercisesPage;
