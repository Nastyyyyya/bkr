import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import ChildNavbar from "../components/ChildNavbar";
import ChildChatbotComponent from "../components/ChildChatbot";
import { assets } from "../assets/assets"; // Імпортуємо активи

const ChildChatBotPage = () => {
  const { childId } = useParams();
  const navigate = useNavigate();
  const { backendUrl, setUserData, setIsLoggedin } = useContext(AppContext);
  const [child, setChild] = useState(null);

  useEffect(() => {
    const fetchChild = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/child/${childId}`, {
          withCredentials: true,
        });
        if (data.success) setChild(data.child);
      } catch (err) {
        console.error("Error fetching child:", err);
      }
    };
    if (childId) fetchChild();
  }, [childId, backendUrl]);

  const handleChildLogout = async () => {
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
      console.error(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#D4E6B8] flex flex-col font-sans relative overflow-hidden">
      {/* Навбар */}
      <ChildNavbar childName={child?.name} onLogout={handleChildLogout} />

      {/* Розпірка для навбару */}
      <div className="h-24 w-full flex-shrink-0"></div>

      <div className="flex-1 container mx-auto px-4 pb-12 flex flex-col items-center relative">
        {/* Контейнер для Помічника + Чату */}
        <div className="w-full flex flex-col lg:flex-row items-center lg:items-end justify-center gap-8 mt-4 relative">
          {/* Помічник (Лисичка) ліворуч */}
          <div className="hidden lg:flex flex-col items-center animate-bounce-slow">
            <div className="">
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45"></div>
            </div>
            <img
              src={assets.header_img}
              alt="Helper"
              className="w-100 h-auto drop-shadow-xl"
            />
          </div>

          {/* Компонент чату */}
          <div className="w-full max-w-4xl z-10">
            <ChildChatbotComponent childId={childId} />
          </div>

          {/* Помічник для мобільних (з'являється лише знизу або маленьким) */}
          <img
            src={assets.header_img}
            alt="Helper"
            className="lg:hidden w-24 h-auto opacity-50 absolute -bottom-10 -right-5 -z-0"
          />
        </div>

        {/* Кнопка повернення */}
        <button
          onClick={() => navigate(`/child-home/${childId}`)}
          className="mt-12 px-10 py-3 bg-white text-[#2c4832] border-2 border-[#2c4832] rounded-full font-black uppercase tracking-widest hover:bg-[#2c4832] hover:text-white transition-all active:scale-95 shadow-sm z-10"
        >
          ← Повернутися до вправ
        </button>
      </div>

      {/* Декоративні елементи фону (можна прибрати, якщо заважають) */}
      <div className="absolute top-40 -left-20 w-64 h-64 bg-white/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-20 -right-20 w-80 h-80 bg-[#2c4832]/5 rounded-full blur-3xl pointer-events-none"></div>
    </div>
  );
};

export default ChildChatBotPage;
