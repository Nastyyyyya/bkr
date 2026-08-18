import React, { useState } from "react";
import axios from "axios";

const scales = [
  {
    id: "health",
    label: "Здоров'я",
    low: "Слабке",
    high: "Міцне",
    iconLow: "🤒",
    iconHigh: "🔋",
  },
  {
    id: "intelligence",
    label: "Навчання",
    low: "Важко",
    high: "Легко",
    iconLow: "🧩",
    iconHigh: "💡",
  },
  {
    id: "character",
    label: "Взаємини",
    low: "Складно",
    high: "Дружньо",
    iconLow: "🗯️",
    iconHigh: "🤝",
  },
  {
    id: "happiness",
    label: "Настрій",
    low: "Сумний",
    high: "Чудовий",
    iconLow: "☁️",
    iconHigh: "☀️",
  },
];

const DemboRubinstein = ({ childId, backendUrl }) => {
  const [values, setValues] = useState({
    health: 50,
    intelligence: 50,
    character: 50,
    happiness: 50,
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (id, val) => {
    setValues((prev) => ({ ...prev, [id]: parseInt(val) }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${backendUrl}/api/dembo/dembo-save`,
        { childId, results: values },
        { withCredentials: true },
      );

      if (response.data.success) {
        setSubmitted(true);
      }
    } catch (err) {
      console.error("Помилка збереження:", err);
      alert("Не вдалося зберегти. Спробуй ще раз.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f8f9f5] p-6 sm:p-10 rounded-[40px] shadow-[0_20px_50px_rgba(44,72,50,0.08)] border border-white w-full max-w-5xl mx-auto mb-10">
      <h2 className="text-2xl sm:text-3xl font-black text-[#2c4832] text-center mb-3 tracking-tight uppercase">
        Як ти почуваєшся?
      </h2>
      <p className="text-center mx-auto max-w-md text-[#2c4832]/60 font-medium mb-10 text-sm sm:text-base leading-relaxed">
        Пересунь повзунки на ту висоту, яка найкраще описує тебе сьогодні
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        {scales.map((scale) => (
          <div key={scale.id} className="flex flex-col items-center">
            <span className="font-bold text-[#2c4832] mb-5 text-base sm:text-lg uppercase tracking-wider text-center">
              {scale.label}
            </span>

            <div className="relative h-64 w-16 bg-white rounded-full border border-[#2c4832]/10 shadow-inner flex flex-col items-center justify-between py-6">
              <span
                className="text-3xl z-10 select-none filter drop-shadow-sm"
                role="img"
                aria-label={scale.high}
              >
                {scale.iconHigh}
              </span>

              <input
                type="range"
                min="0"
                max="100"
                value={values[scale.id]}
                onChange={(e) => handleChange(scale.id, e.target.value)}
                className="dembo-slider"
                aria-label={`Оцінка за шкалою ${scale.label}`}
              />

              <div
                className="absolute bottom-0 w-full bg-[#2c4832]/5 rounded-b-full transition-all duration-300"
                style={{ height: `${values[scale.id]}%`, opacity: 0.4 }}
              />

              <span
                className="text-3xl z-10 select-none filter drop-shadow-sm"
                role="img"
                aria-label={scale.low}
              >
                {scale.iconLow}
              </span>
            </div>

            <div className="mt-6 flex flex-col items-center w-full">
              <div className="inline-block bg-[#2c4832] text-white px-4 py-1 rounded-2xl text-lg font-black shadow-lg mb-3 min-w-[65px] text-center">
                {values[scale.id]}%
              </div>
              <p className="text-[11px] font-black uppercase tracking-widest text-[#2c4832]/60 text-center leading-tight max-w-[110px]">
                {scale.high} <br /> / <br /> {scale.low}
              </p>
            </div>
          </div>
        ))}
      </div>

      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-5 bg-[#2c4832] hover:bg-[#1a2e20] text-white font-black text-xl rounded-[30px] shadow-[0_15px_30px_rgba(44,72,50,0.2)] transform transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? "ЗБЕРЕЖЕННЯ..." : "ЗБЕРЕГТИ РЕЗУЛЬТАТ"}
        </button>
      ) : (
        <div className="text-center p-6 bg-white rounded-[30px] border-2 border-[#2c4832]/20 text-[#2c4832] font-black text-xl animate-in zoom-in">
          Дякую! Твоя відповідь записана
        </div>
      )}

      <style jsx>{`
        .dembo-slider {
          -webkit-appearance: none;
          /* Ширина має відповідати новій висоті контейнера h-64 (256px - padding) */
          width: 200px;
          height: 40px;
          background: transparent;
          transform: rotate(-90deg);
          position: absolute;
          top: 48%;
          left: 50%;
          margin-left: -100px;
          cursor: pointer;
          z-index: 20;
        }
        .dembo-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 40px;
          width: 40px;
          border-radius: 50%;
          background: white;
          border: 5px solid #2c4832;
          box-shadow: 0 4px 12px rgba(44, 72, 50, 0.2);
          cursor: pointer;
        }
        .dembo-slider::-moz-range-thumb {
          height: 40px;
          width: 40px;
          border-radius: 50%;
          background: white;
          border: 5px solid #2c4832;
          box-shadow: 0 4px 12px rgba(44, 72, 50, 0.2);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default DemboRubinstein;
