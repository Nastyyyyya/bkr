import React, { useState } from "react";
import axios from "axios";

const scales = [
  { id: "health", label: "Здоров'я", low: "Часто хворію 🤒", high: "Дуже міцний 💪" },
  { id: "intelligence", label: "Розум", low: "Важко вчитися 🧩", high: "Все знаю 🧠" },
  { id: "character", label: "Характер", low: "Я шкідливий 😤", high: "Я герой ✨" },
  { id: "happiness", label: "Щастя", low: "Мені сумно 😢", high: "Я щасливий! 🎉" },
];

const DemboRubinstein = ({ childId, backendUrl }) => {
  const [values, setValues] = useState({ health: 50, intelligence: 50, character: 50, happiness: 50 });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (id, val) => {
    setValues((prev) => ({ ...prev, [id]: parseInt(val) }));
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post(`${backendUrl}/api/dembo/dembo-save`, {
        childId,
        results: values,
      }, { withCredentials: true });

      if (response.data.success) {
        setSubmitted(true);
      }
    } catch (err) {
      console.error("Помилка збереження:", err);
      alert("Ой! Щось пішло не так. Спробуй ще раз.");
    }
  };

  return (
    <div className="bg-white p-6 sm:p-10 rounded-[40px] shadow-2xl border-4 border-indigo-50 w-full max-w-5xl mx-auto">
      <h2 className="text-2xl sm:text-3xl font-black text-indigo-600 text-center mb-10 tracking-tight">
        Оціни свої суперсили! 🚀
      </h2>
      
      <div className="flex flex-wrap justify-around gap-6 mb-12">
        {scales.map((scale) => (
          <div key={scale.id} className="flex flex-col items-center w-20 sm:w-32">
            <span className="font-bold text-gray-700 mb-4 text-sm sm:text-lg">{scale.label}</span>
            
            <div className="relative h-72 w-14 sm:w-16 bg-gradient-to-b from-blue-50 to-indigo-50 rounded-full border-4 border-white shadow-inner flex flex-col items-center justify-between py-6">
              <span className="text-2xl z-10 select-none">🚀</span>
              
              <input
                type="range"
                min="0"
                max="100"
                value={values[scale.id]}
                onChange={(e) => handleChange(scale.id, e.target.value)}
                className="dembo-slider"
              />
              
              <span className="text-2xl z-10 select-none">🐌</span>
            </div>

            <div className="mt-6 text-center">
              <div className="inline-block bg-indigo-500 text-white px-3 py-1 rounded-full text-sm sm:text-lg font-black shadow-md mb-2">
                {values[scale.id]}%
              </div>
              <p className="text-[10px] leading-tight text-gray-400 font-bold uppercase tracking-tighter">
                {scale.high.split(' ')[0]} / {scale.low.split(' ')[0]}
              </p>
            </div>
          </div>
        ))}
      </div>

      {!submitted ? (
        <button
          onClick={handleSubmit}
          className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-black text-xl rounded-3xl shadow-xl transform transition active:scale-95"
        >
          ЗБЕРЕГТИ РЕЗУЛЬТАТ ✨
        </button>
      ) : (
        <div className="text-center p-6 bg-green-100 rounded-3xl border-2 border-green-200 text-green-700 font-black text-xl animate-pulse">
          Чудово! Результати в базі 🏆
        </div>
      )}

      <style jsx>{`
        .dembo-slider {
          -webkit-appearance: none;
          width: 220px;
          height: 10px;
          background: transparent;
          transform: rotate(-90deg);
          position: absolute;
          top: 48%;
          left: 50%;
          margin-left: -110px;
          cursor: pointer;
          z-index: 20;
        }
        .dembo-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 35px;
          width: 35px;
          border-radius: 50%;
          background: #6366f1;
          border: 4px solid white;
          box-shadow: 0 4px 10px rgba(0,0,0,0.2);
          cursor: pointer;
        }
        .dembo-slider::-moz-range-thumb {
          height: 35px;
          width: 35px;
          border-radius: 50%;
          background: #6366f1;
          border: 4px solid white;
          box-shadow: 0 4px 10px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
};

export default DemboRubinstein;