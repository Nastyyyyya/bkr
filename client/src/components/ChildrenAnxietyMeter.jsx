import React, { useState } from "react";

const ChildrenAnxietyMeter = ({ childId, backendUrl }) => {
  const [tempLevel, setTempLevel] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false); // Для запобігання дублювання запитів

  const scale = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

  const getEmoji = (val) => {
    if (val >= 9) return "😡";
    if (val >= 7) return "😰";
    if (val >= 5) return "😟";
    if (val >= 3) return "🙂";
    return "😃";
  };

  const getColor = (val) => {
    if (val >= 8) return "#ef4444"; // Червоний
    if (val >= 5) return "#facc15"; // Жовтий
    return "#22c55e"; // Зелений
  };

  const handleSave = async () => {
    if (isSubmitted || loading || !childId) return;

    setLoading(true);

    // Визначаємо статус та поради перед збереженням
    let status = "Спокій";
    let advice = "Дитина почувається у безпеці.";

    if (tempLevel >= 9) {
      status = "Критичний (Паніка)";
      advice = "Потрібна негайна підтримка дорослого та дихальні вправи.";
    } else if (tempLevel >= 7) {
      status = "Сильна тривога";
      advice = "Варто відволікти дитину та обговорити причину стресу.";
    } else if (tempLevel >= 5) {
      status = "Помірна тривога";
      advice = "Дитина чимось занепокоєна. Спокійна розмова допоможе.";
    } else if (tempLevel >= 3) {
      status = "Легке хвилювання";
      advice = "Природний рівень активності або легка непевність.";
    }

    try {
      const response = await fetch(
        `${backendUrl}/api/child-anxiety/${childId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            level: tempLevel,
            status: status,
            advice: advice,
            date: new Date(),
          }),
          credentials: "include",
        },
      );

      const result = await response.json();

      if (result.success) {
        setIsSubmitted(true);
      } else {
        console.error("Помилка від сервера:", result.message);
        alert("Не вдалося зберегти: " + result.message);
      }
    } catch (err) {
      console.error("Помилка мережі:", err);
      alert("Помилка зв'язку з сервером.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center p-8 bg-gray-50 rounded-[50px] shadow-2xl max-w-sm mx-auto select-none border-4 border-white">
      <h2 className="text-2xl font-black text-gray-800 mb-8 uppercase tracking-tighter text-center">
        Термометр тривожності
      </h2>

      <div className="relative flex items-center justify-center h-[450px] w-full gap-4">
        {/* ЛІВА ЧАСТИНА: СМАЙЛИК-ІНДИКАТОР */}
        <div className="w-20 flex justify-center items-center">
          <div className="text-6xl transition-all duration-500 transform hover:scale-110">
            {getEmoji(tempLevel)}
          </div>
        </div>

        {/* ЦЕНТР: МАЛЬОВАНИЙ ГРАДУСНИК (SVG) */}
        <div className="relative w-24 h-full flex flex-col items-center">
          <svg
            width="80"
            height="400"
            viewBox="0 0 80 400"
            className="drop-shadow-lg"
          >
            <rect
              x="25"
              y="10"
              width="30"
              height="340"
              rx="15"
              fill="#ffffff"
              stroke="#333"
              strokeWidth="4"
            />
            <circle
              cx="40"
              cy="350"
              r="35"
              fill="#ffffff"
              stroke="#333"
              strokeWidth="4"
            />

            <rect
              x="29"
              y={340 - tempLevel * 31}
              width="22"
              height={tempLevel * 31}
              rx="11"
              fill={getColor(tempLevel)}
              className="transition-all duration-700 ease-out"
            />
            <circle
              cx="40"
              cy="350"
              r="31"
              fill={getColor(tempLevel)}
              className="transition-all duration-700 ease-out"
            />

            <rect
              x="32"
              y="20"
              width="6"
              height="310"
              rx="3"
              fill="rgba(255,255,255,0.4)"
            />
          </svg>
        </div>

        {/* ПРАВА ЧАСТИНА: КНОПКИ-ЦИФРИ */}
        <div className="flex flex-col justify-between h-[310px] mb-[90px]">
          {scale.map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => !isSubmitted && setTempLevel(num)}
              className={`w-10 h-10 rounded-xl font-black text-lg transition-all flex items-center justify-center
                ${
                  tempLevel === num
                    ? "bg-black text-white scale-125 shadow-lg translate-x-2"
                    : "bg-white text-gray-400 hover:bg-gray-200 shadow-sm"
                }`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      {/* КНОПКА ЗБЕРЕГТИ */}
      {!isSubmitted ? (
        <button
          onClick={handleSave}
          disabled={loading}
          className={`mt-4 w-full text-white py-5 rounded-full font-black text-xl shadow-[0_6px_0_#b91c1c] transition-all transform
            ${loading ? "bg-gray-400 shadow-none cursor-wait" : "bg-red-500 hover:shadow-[0_2px_0_#b91c1c] hover:translate-y-1 active:shadow-none active:translate-y-2"}
          `}
        >
          {loading ? "ЗБЕРЕЖЕННЯ..." : "ЗБЕРЕГТИ РЕЗУЛЬТАТ"}
        </button>
      ) : (
        <div className="mt-4 text-center p-4 bg-green-50 rounded-3xl border-2 border-green-200 w-full animate-bounce">
          <p className="text-green-700 font-black italic">
            ДЯКУЮ! ВСЕ ЗАПИСАНО ✨
          </p>
        </div>
      )}
    </div>
  );
};

export default ChildrenAnxietyMeter;
