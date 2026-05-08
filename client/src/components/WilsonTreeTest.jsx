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
        selectedId: num,
      });
      if (data.success && onSelect) onSelect(num);
    } catch (error) {
      console.error("Помилка:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col items-center bg-[#f8f9f5] p-6 sm:p-10 rounded-[40px] shadow-[0_20px_50px_rgba(44,72,50,0.08)] border border-white w-full max-w-4xl mx-auto my-10">
      <h3 className="text-2xl sm:text-3xl font-black text-[#2c4832] mb-2 text-center uppercase tracking-tight">
        Де ти на дереві? 🌳
      </h3>
      <p className="text-center text-[#2c4832]/60 font-medium mb-8 text-sm sm:text-base px-4">
        Подивись на малюнок і обери чоловічка, який найбільше схожий на тебе
        зараз
      </p>

      <div className="w-full max-w-lg mb-10 overflow-hidden rounded-[30px] border-4 border-white shadow-xl relative bg-white transition-transform hover:scale-[1.01]">
        <img
          src={assets.blob_tree}
          alt="Тест Дерево"
          className="w-full h-auto p-2"
        />
        {isSaving && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#2c4832]/10 border-t-[#2c4832]"></div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-7 gap-3 w-full max-w-2xl px-2">
        {numbers.map((num) => (
          <button
            key={num}
            disabled={isSaving}
            onClick={() => handleSelect(num)}
            className={`h-12 w-12 sm:h-14 sm:w-14 rounded-2xl font-black text-lg transition-all duration-300 ${
              selected === num
                ? "bg-[#2c4832] text-white scale-110 shadow-lg"
                : "bg-white text-[#2c4832] border border-[#2c4832]/10 hover:border-[#2c4832] hover:bg-[#2c4832]/5"
            } disabled:opacity-50`}
          >
            {num}
          </button>
        ))}
      </div>

      {selected && !isSaving && (
        <div className="mt-8 py-3 px-8 bg-white border-2 border-[#2c4832]/10 text-[#2c4832] rounded-full font-black uppercase tracking-widest text-xs animate-bounce">
          Твій вибір: номер {selected}
        </div>
      )}
    </div>
  );
};

export default WilsonTreeTest;
