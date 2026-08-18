import React from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  return (
    <section className="section-hero relative w-full h-screen overflow-hidden flex flex-col justify-center mb-24">
      <div
        className="hero-effect absolute inset-0 z-0"
        style={{ backgroundImage: `url(${assets.bg_effect})` }}
      ></div>

      <div className="relative z-10 w-full bg-[#F3F0E8] py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <img
            src={assets.logo}
            alt="CALMLI"
            className="w-64 sm:w-80 md:w-[400px] lg:w-[500px] mx-auto mb-10 transition-all"
          />

          <div className="max-w-2xl mx-auto">
            <h1 className="text-sm md:text-lg font-medium text-[#2d3422] leading-relaxed px-4 md:px-0">
              Турбота про дитину починається з вашого емоційного балансу. Тут ви
              знайдете інструменти для самодопомоги та методики для підтримки
              ментального здоров'я вашої малечі.
            </h1>
          </div>

          <button
            onClick={() => navigate("/test/start")}
            className="mt-10 px-10 py-3 bg-[#354024] text-white text-base md:text-lg font-medium rounded-full hover:bg-[#45542f] active:scale-95 transition-all duration-200 shadow-md"
          >
            З чого почати?
          </button>
        </div>
      </div>
    </section>
  );
};

export default Header;
