import React, { useState } from "react";
import axios from "axios";
import { assets } from "../assets/assets";

const WilsonTreeTest = ({ childId, backendUrl, onSelect }) => {
  const [selected, setSelected] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const numbers = Array.from({ length: 21 }, (_, i) => i + 1);

  const handleSelect = async (num) => {
    setSelected(num);
    setIsSaving(true);

    try {
      const { data } = await axios.post(`${backendUrl}/api/wilson/save`, {
        childId,
        selectedId: num
      });

      if (data.success) {
        if (onSelect) onSelect(num);
      }
    } catch (error) {
      console.error("Помилка збереження результату:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col items-center bg-white p-6 rounded-3xl shadow-xl border border-indigo-100 w-full">
      <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
        Обери свій номер на дереві 🌳
      </h3>
      
      <div className="w-full max-w-md mb-8 overflow-hidden rounded-2xl border-2 border-indigo-50 relative">
        <img 
          src={assets.blob_tree}
          alt="Тест Дерево" 
          className="w-full h-auto"
        />
        {isSaving && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-7 gap-3 w-full max-w-2xl">
        {numbers.map((num) => (
          <button
            key={num}
            disabled={isSaving}
            onClick={() => handleSelect(num)}
            className={`h-12 w-12 rounded-xl font-bold transition-all ${
              selected === num
                ? "bg-indigo-600 text-white scale-110 shadow-lg"
                : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
            } disabled:opacity-50`}
          >
            {num}
          </button>
        ))}
      </div>

      {selected && !isSaving && (
        <div className="mt-6 py-2 px-6 bg-green-100 text-green-700 rounded-full font-medium animate-bounce">
          Результат збережено! Ти вибрав номер {selected}
        </div>
      )}
    </div>
  );
};

export default WilsonTreeTest;