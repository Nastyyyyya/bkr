import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import ChildChatbot from "../components/ChildChatbot";

const ChildChatBot = () => {
  const { childId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-yellow-200 to-pink-300 p-6">
      <h1 className="text-3xl sm:text-5xl font-bold mb-4">
        Поділися своїми емоціями 💛
      </h1>

      <p className="text-lg text-center mb-6 max-w-md">
        Я поруч і готовий тебе вислухати 🤍
      </p>

      {/* 🧠 ЧАТ-БОТ */}
      <ChildChatbot />

      <button
        onClick={() => navigate(`/child-home/${childId}`)}
        className="mt-6 px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600"
      >
        Назад
      </button>
    </div>
  );
};

export default ChildChatBot;
