import React, { useState } from "react";

const ChildrenAnxietyMeter = ({ childId, backendUrl }) => {
  const [tempLevel, setTempLevel] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const scale = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

  const getEmoji = (val) => {
    if (val >= 9) return "😡";
    if (val >= 7) return "😰";
    if (val >= 5) return "😟";
    if (val >= 3) return "🙂";
    return "😃";
  };

  const getColor = (val) => {
    if (val >= 8) return "#e63946";
    if (val >= 5) return "#ffb703";
    return "#2c4832";
  };

  const handleSave = async () => {
    if (isSubmitted || loading || !childId) return;
    setLoading(true);

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
      if (result.success) setIsSubmitted(true);
    } catch (err) {
      console.error("Помилка:", err);
      alert("Помилка зв'язку з сервером.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center bg-[#f8f9f5] p-8 sm:p-12 rounded-[40px] shadow-[0_20px_50px_rgba(44,72,50,0.08)] border border-white w-full max-w-4xl mx-auto my-10 select-none">
      <div className="max-w-md w-full flex flex-col items-center">
        <h2 className="text-2xl sm:text-3xl font-black text-[#2c4832] mb-2 uppercase tracking-tight text-center">
          Термометр тривожності
        </h2>
        <p className="text-center text-[#2c4832]/60 font-medium mb-10 text-sm sm:text-base px-4">
          Обери число, яке показує, як сильно ти зараз хвилюєшся
        </p>

        <div className="relative flex items-center justify-center h-[450px] w-full gap-8 sm:gap-12">
          <div className="w-20 flex justify-center items-center">
            <div className="text-7xl transition-all duration-500 transform hover:rotate-12">
              {getEmoji(tempLevel)}
            </div>
          </div>

          <div className="relative w-24 h-full flex flex-col items-center">
            <svg
              width="80"
              height="400"
              viewBox="0 0 80 400"
              className="filter drop-shadow-lg"
            >
              <rect
                x="25"
                y="10"
                width="30"
                height="340"
                rx="15"
                fill="#ffffff"
                stroke="#2c4832"
                strokeWidth="2"
                opacity="0.9"
              />
              <circle
                cx="40"
                cy="350"
                r="35"
                fill="#ffffff"
                stroke="#2c4832"
                strokeWidth="2"
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

          <div className="flex flex-col justify-between h-[310px] mb-[90px]">
            {scale.map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => !isSubmitted && setTempLevel(num)}
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl font-black text-base transition-all flex items-center justify-center
                  ${
                    tempLevel === num
                      ? "bg-[#2c4832] text-white scale-125 shadow-xl translate-x-2"
                      : "bg-white text-[#2c4832]/40 hover:bg-[#2c4832]/5 border border-[#2c4832]/10 shadow-sm"
                  }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {!isSubmitted ? (
          <button
            onClick={handleSave}
            disabled={loading}
            className={`mt-6 w-full max-w-sm text-white py-5 rounded-[30px] font-black text-xl transition-all transform
              ${
                loading
                  ? "bg-gray-400 cursor-wait"
                  : "bg-[#2c4832] hover:bg-[#1a2e20] shadow-[0_15px_30px_rgba(44,72,50,0.15)] active:scale-95"
              }
            `}
          >
            {loading ? "ЗБЕРЕЖЕННЯ..." : "ЗБЕРЕГТИ РЕЗУЛЬТАТ"}
          </button>
        ) : (
          <div className="mt-6 text-center p-5 bg-white rounded-[30px] border-2 border-[#2c4832]/10 w-full max-w-sm animate-in zoom-in duration-500 shadow-sm">
            <p className="text-[#2c4832] font-black uppercase tracking-widest text-sm">
              Дякую! Твій стан записано ✨
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChildrenAnxietyMeter;
