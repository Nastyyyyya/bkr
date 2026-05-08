import React, { useState } from "react";
import { moods, moodResponses } from "./MoodConfig";
import { assets } from "../assets/assets";
import axios from "axios";

const MoodModal = ({ childId, backendUrl, onYes, onNo }) => {
  const [step, setStep] = useState(1);
  const [selectedMood, setSelectedMood] = useState(null);
  const [loading, setLoading] = useState(false);

  const saveMood = async () => {
    try {
      setLoading(true);
      const today = new Date();
      const localDateKey = `${today.getFullYear()}-${String(
        today.getMonth() + 1,
      ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

      await axios.post(`${backendUrl}/api/child-mood`, {
        childId,
        mood: selectedMood.id,
        date: localDateKey,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#354024]/60 backdrop-blur-md flex items-center justify-center z-50 p-6">
      {/* Збільшили max-w-md для простору */}
      <div className="bg-[#F3F0E8] rounded-[45px] p-10 md:p-14 max-w-xl w-full text-center shadow-[0_20px_50px_rgba(0,0,0,0.2)] border-b-8 border-[#354024]/10">
        {/* Велика аватарка з рамкою */}
        <div className="relative mb-10">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full mx-auto bg-white p-2 shadow-inner ring-8 ring-[#354024]/5">
            <img
              src={assets.header_img}
              alt="header"
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          {selectedMood && (
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white rounded-2xl px-4 py-2 shadow-lg text-3xl animate-bounce">
              {selectedMood.emoji}
            </div>
          )}
        </div>

        {/* КРОК 1 */}
        {step === 1 && (
          <div className="animate-in fade-in zoom-in duration-500">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#354024] mb-4">
              Привіт! Радий тебе бачити!
            </h2>
            <p className="text-xl text-[#354024]/60 mb-12 text-center">
              Обери настрій, який у тебе зараз:
            </p>

            {/* Великі кнопки емодзі з великими відступами */}
            <div className="flex justify-around items-center gap-4 mb-6">
              {moods.map((mood) => (
                <button
                  key={mood.id}
                  onClick={() => {
                    setSelectedMood(mood);
                    setStep(2);
                  }}
                  className="group relative flex flex-col items-center transition-all"
                >
                  <div className="text-5xl md:text-6xl mb-3 transform transition-transform duration-300 group-hover:scale-125 group-active:scale-90 cursor-pointer">
                    {mood.emoji}
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#354024]/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    {mood.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* КРОК 2 */}
        {step === 2 && selectedMood && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
            <h2 className="text-2xl font-serif font-bold text-[#354024] mb-6 px-4 leading-snug">
              {moodResponses[selectedMood.id]}
            </h2>

            <div className="space-y-4 max-w-xs mx-auto mt-10">
              <button
                disabled={loading}
                onClick={async () => {
                  await saveMood();
                  onYes();
                }}
                className="w-full py-5 bg-[#354024] text-white rounded-[25px] text-lg font-bold shadow-[0_10px_20px_rgba(53,64,36,0.2)] hover:bg-[#45542f] hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? "Завантаження..." : "Хочу поговорити"}
              </button>

              <button
                disabled={loading}
                onClick={async () => {
                  await saveMood();
                  onNo();
                }}
                className="w-full py-4 text-[#354024]/50 text-sm font-bold uppercase tracking-[0.2em] hover:text-[#354024] transition-colors"
              >
                Не зараз, дякую
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoodModal;
