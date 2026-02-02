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
        today.getMonth() + 1
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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-xl">
        <img
          src={assets.header_img}
          alt="header"
          className="w-32 h-32 rounded-full mb-4 mx-auto"
        />

        {/* КРОК 1 */}
        {step === 1 && (
          <>
            <h2 className="text-xl font-semibold mb-2">
              Радий тебе бачити сьогодні 💛
            </h2>
            <p className="mb-4">Як у тебе настрій?</p>

            <div className="flex justify-between mb-4">
              {moods.map((mood) => (
                <button
                  key={mood.id}
                  onClick={() => {
                    setSelectedMood(mood);
                    setStep(2);
                  }}
                  className="text-3xl hover:scale-110 transition"
                >
                  {mood.emoji}
                </button>
              ))}
            </div>

            <div className="flex justify-between text-sm text-gray-500">
              {moods.map((mood) => (
                <span key={mood.id}>{mood.label}</span>
              ))}
            </div>
          </>
        )}

        {/* КРОК 2 */}
        {step === 2 && selectedMood && (
          <>
            <div className="text-4xl mb-3">{selectedMood.emoji}</div>

            <p className="mb-6 text-gray-700">
              {moodResponses[selectedMood.id]}
            </p>

            <div className="flex gap-4">
              <button
                disabled={loading}
                onClick={async () => {
                  await saveMood();
                  onYes();
                }}
                className="flex-1 py-2 bg-green-500 text-white rounded-full hover:bg-green-600"
              >
                Хочу поговорити
              </button>

              <button
                disabled={loading}
                onClick={async () => {
                  await saveMood();
                  onNo();
                }}
                className="flex-1 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
              >
                Не зараз
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MoodModal;
