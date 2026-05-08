import React, { useState, useContext } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext.jsx";
import { toast } from "react-toastify";

const LUSCHER_COLORS = [
  { code: "1", name: "Темно-синій", hex: "#004685" },
  { code: "2", name: "Синьо-зелений", hex: "#007b5f" },
  { code: "3", name: "Оранжево-червоний", hex: "#e2001a" },
  { code: "4", name: "Світло-жовтий", hex: "#fff200" },
  { code: "5", name: "Фіолетовий", hex: "#8a2071" },
  { code: "6", name: "Коричневий", hex: "#6c4128" },
  { code: "7", name: "Чорний", hex: "#000000" },
  { code: "0", name: "Сірий", hex: "#919699" },
];

const LuscherTest = ({ childId }) => {
  const { backendUrl } = useContext(AppContext);
  const [step, setStep] = useState(1);
  const [selection1, setSelection1] = useState([]);
  const [selection2, setSelection2] = useState([]);
  const [resultText, setResultText] = useState(null);

  const handleSelect = (color) => {
    if (step === 1 && selection1.length < 8) {
      setSelection1((prev) => [...prev, color]);
    } else if (step === 2 && selection2.length < 8) {
      setSelection2((prev) => [...prev, color]);
    }
  };

  const nextStep = async () => {
    if (step === 1 && selection1.length === 8) {
      setStep(2);
    } else if (step === 2 && selection2.length === 8) {
      if (!childId) return toast.error("ID дитини не знайдено");

      try {
        const payload = {
          childId,
          selection1: selection1.map((c) => c.code),
          selection2: selection2.map((c) => c.code),
        };

        const { data } = await axios.post(
          `${backendUrl}/api/luscher/save`,
          payload,
        );

        if (data.success) {
          setResultText(data.interpretation);
        } else {
          toast.error("Не вдалося отримати результат");
        }
      } catch (err) {
        console.error("Помилка:", err);
        toast.error("Сервер не відповідає");
      }
    }
  };

  if (resultText) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border-4">
        <h2 className="text-2xl font-bold mb-6 text-indigo-700">
          Ось результати:
        </h2>
        <div className="space-y-4 text-left mb-8">
          {resultText.map((paragraph, index) => (
            <div
              key={index}
              className="bg-indigo-50 p-5 rounded-2xl border-l-4 border-indigo-400"
            >
              <p className="text-indigo-900 font-medium">{paragraph}</p>
            </div>
          ))}
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-12 py-4 bg-indigo-600 text-white rounded-full font-bold"
        >
          Зіграти ще раз ✨
        </button>
      </div>
    );
  }

  const currentSelection = step === 1 ? selection1 : selection2;
  const availableColors = LUSCHER_COLORS.filter(
    (c) => !currentSelection.some((sel) => sel.code === c.code),
  );

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-2 text-center">Крок {step}</h2>
      <div className="grid grid-cols-4 gap-4 mb-10 justify-items-center">
        {availableColors.map((c) => (
          <button
            key={c.code}
            onClick={() => handleSelect(c)}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl transition-all hover:scale-110"
            style={{ backgroundColor: c.hex }}
          />
        ))}
      </div>

      <div className="mb-8">
        <h4 className="font-bold mb-3 text-gray-700">Твій вибір:</h4>
        <div className="flex gap-2 h-12">
          {currentSelection.map((c, i) => (
            <div
              key={i}
              className="w-10 h-10 rounded-lg"
              style={{ backgroundColor: c.hex }}
            />
          ))}
          {Array.from({ length: 8 - currentSelection.length }).map((_, i) => (
            <div
              key={i}
              className="w-10 h-10 border-2 border-dashed border-gray-200 rounded-lg"
            />
          ))}
        </div>
      </div>

      <button
        className={`w-full py-4 rounded-2xl font-bold text-lg ${
          currentSelection.length === 8
            ? "bg-indigo-600 text-white"
            : "bg-gray-200 text-gray-400"
        }`}
        onClick={nextStep}
        disabled={currentSelection.length < 8}
      >
        {step === 1 ? "Далі" : "Дізнатися результат"}
      </button>
    </div>
  );
};

export default LuscherTest;
