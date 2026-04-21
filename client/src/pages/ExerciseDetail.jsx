import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const ExerciseDetail = () => {
  const { id } = useParams();
  const [exercise, setExercise] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:4000/api/exercises/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.role === "parents") {
          setExercise(data);
        }
      });
  }, [id]);

  if (!exercise) {
    return (
      <div className="min-h-screen bg-[#f3f0e8] flex items-center justify-center">
        <p className="text-[#354024] font-serif italic animate-pulse">
          Пошук вашої практики...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f0e8] py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        {/* Кнопка Повернення */}
        <Link
          to="/exercises"
          className="group inline-flex items-center text-[#354024]/60 hover:text-[#354024] transition-colors mb-12 uppercase tracking-widest text-[10px] font-bold"
        >
          <svg
            className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Назад до каталогу
        </Link>

        {/* Шапка статті */}
        <header className="mb-10 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            {exercise.tags?.map((tag) => (
              <span
                key={tag}
                className="text-[#354024]/40 text-[10px] uppercase tracking-wider"
              >
                #{tag}
              </span>
            ))}
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#354024] leading-tight mb-6">
            {exercise.title}
          </h1>
          <div className="w-12 h-[2px] bg-[#354024] mx-auto opacity-30"></div>
        </header>

        {/* Основне зображення */}
        {exercise.image && (
          <div className="relative mb-12">
            <div className="absolute inset-0 bg-[#354024]/5 translate-x-3 translate-y-3 rounded-3xl -z-10"></div>
            <img
              src={exercise.image}
              alt={exercise.title}
              className="w-full h-[450px] object-cover rounded-3xl shadow-sm"
            />
          </div>
        )}

        {/* Текстовий блок */}
        <article className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-[#354024]/5 border border-[#354024]/5">
          <div className="prose prose-stone max-w-none">
            {/* Використання whitespace-pre-line для збереження абзаців */}
            <p className="text-[#354024]/80 text-lg leading-[1.8] font-light whitespace-pre-line first-letter:text-5xl first-letter:font-serif first-letter:mr-3 first-letter:float-left first-letter:text-[#354024]">
              {exercise.fullText}
            </p>
          </div>

          {/* Футер статті */}
          <div className="mt-12 pt-8 border-t border-[#354024]/10 flex flex-col items-center">
            <p className="text-[#354024]/50 italic text-sm mb-6 text-center">
              Сподіваємося, ця вправа допоможе вам знайти внутрішній спокій
              сьогодні.
            </p>
            <button
              onClick={() => window.print()}
              className="px-6 py-2 border border-[#354024]/20 rounded-full text-[#354024] text-xs uppercase tracking-widest hover:bg-[#354024] hover:text-[#f3f0e8] transition-all"
            >
              Зберегти у PDF
            </button>
          </div>
        </article>
      </div>
    </div>
  );
};

export default ExerciseDetail;
