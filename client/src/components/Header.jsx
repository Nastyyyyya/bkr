import React, { useContext } from "react";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom"; // ⬅️ ДОДАЛИ

const Header = () => {
  const { userData } = useContext(AppContext);
  const navigate = useNavigate(); // ⬅️ ДОДАЛИ

  return (
    <section className="section-hero relative w-full h-screen overflow-hidden mb-32">
      {/* Основний фон */}

      {/* Ефект поверх лівих 70% */}
      <div
        className="hero-effect"
        style={{ backgroundImage: `url(${assets.bg_effect})` }}
      ></div>

      {/* Контент */}
      <div className="hero-container">
        <img
          src={assets.header_img}
          alt=""
          className="w-36 h-36 rounded-full mx-auto"
        />

        <h1 className="hero-title">
          Привіт {userData ? userData.name : "Друже"}! <br />
          Радий що ти завітав
        </h1>

        <p className="mt-4 max-w-md mx-auto text-white">
          Зустрічай свого друга-помічника. Разом ми досліджуватимемо світ
          емоцій, виконуватимемо веселі завдання і робитимемо твоє життя
          яскравішим!
        </p>

        <button
          onClick={() => navigate("/test/start")} // ⬅️ ОЦЕ ГОЛОВНЕ
          className="mt-6 px-6 py-3 bg-[#354024] text-white rounded-full hover:brightness-110 transition"
        >
          З чого почати?
        </button>
      </div>
    </section>
  );
};

export default Header;
