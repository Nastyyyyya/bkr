import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import ChildNavbar from "../components/ChildNavbar";
import { assets } from "../assets/assets";
import "../index.css";

const Fairytales = () => {
  const { childId } = useParams();
  const navigate = useNavigate();
  const { backendUrl, setUserData, setIsLoggedin } = useContext(AppContext);
  const [child, setChild] = useState(null);

  // Текст для твого помічника (виправляє помилку 'assistantText' is not defined)
  const assistantText = "Приємного читання! 📖";

  // Список шляхів до казок
  const stories = [
    { id: 1, path: "/twine/Fairytale.html" },
    { id: 2, path: "/twine/RabbitStory.html" },
    { id: 3, path: "/twine/Stars.html" },
  ];

  useEffect(() => {
    const fetchChild = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/child/${childId}`, {
          withCredentials: true,
        });
        if (data.success) setChild(data.child);
      } catch (err) {
        console.error("Помилка завантаження даних дитини:", err);
      }
    };
    if (childId) fetchChild();
  }, [childId, backendUrl]);

  const handleLogout = async () => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/auth/logout`,
        {},
        { withCredentials: true },
      );
      if (data.success) {
        setUserData(false);
        setIsLoggedin(false);
        navigate("/");
      }
    } catch (error) {
      console.error("Помилка виходу:", error.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#D4E6B8] flex flex-col font-sans selection:bg-[#2c4832] selection:text-white">
      {/* Навбар */}
      <ChildNavbar childName={child?.name} onLogout={handleLogout} />

      {/* Контейнер контенту */}
      <div className="flex-1 container mx-auto px-4 pb-20 flex flex-col items-center">
        {/* ХЕДЕР (Заголовок + Назад) */}
        <div className="relative w-full max-w-5xl flex items-center justify-center py-6 mt-4">
          <button
            onClick={() => navigate(`/child-home/${childId}`)}
            className="absolute left-0 flex items-center gap-2 text-[#2c4832] font-black uppercase text-xs tracking-[0.2em] hover:opacity-50 transition-all group"
          >
            <span className="text-2xl group-hover:-translate-x-1 transition-transform duration-300">
              ←
            </span>
            <span className="hidden sm:inline">Назад</span>
          </button>

          <h1 className="text-3xl md:text-4xl font-black text-[#2c4832] uppercase tracking-tighter">
            Бібліотека казок
          </h1>
          <div className="w-10 h-10 hidden sm:block"></div>
        </div>

        {/* СПИСОК КАЗОК (Блоки без назв, тільки iframe) */}
        <div className="w-full flex flex-col gap-16 mt-4">
          {stories.map((story) => (
            <div key={story.id} className="w-full max-w-5xl mx-auto">
              <div className="w-full h-[650px] rounded-[40px] overflow-hidden shadow-[0_30px_60px_rgba(44,72,50,0.1)] bg-white border border-white/60">
                <iframe
                  src={story.path}
                  title={`Казка ${story.id}`}
                  className="w-full h-full border-none"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Кнопка закриття бібліотеки */}
        <button
          onClick={() => navigate(`/child-home/${childId}`)}
          className="mt-16 px-12 py-4 bg-[#2c4832] text-white rounded-full font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
        >
          Закрити бібліотеку
        </button>
      </div>

      {/* ПЕРСОНАЖ-ПОМІЧНИК (КЛІКАБЕЛЬНИЙ) */}
      <div
        className="assistant-container group cursor-pointer"
        onClick={() => navigate(`/child-chatbot/${childId}`)}
      >
        <div className="speech-bubble group-hover:scale-105 transition-transform">
          <p className="p-assist">{assistantText}</p>
        </div>
        <img
          src={assets.header_img}
          alt="Helper"
          className="assistant-img transition-all duration-300 group-hover:scale-110 group-active:scale-90"
        />
      </div>
    </div>
  );
};

export default Fairytales;
