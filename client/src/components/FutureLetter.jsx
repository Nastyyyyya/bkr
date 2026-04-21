import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const FutureLetter = ({ childId, backendUrl }) => {
  const [text, setText] = useState("");
  const [isLocked, setIsLocked] = useState(true); // За замовчуванням закрито
  const [isAnimating, setIsAnimating] = useState(false);
  const [oldLetter, setOldLetter] = useState(null);
  const [showOldLetter, setShowOldLetter] = useState(false);

  const today = new Date();
  const isSunday = today.getDay() === 0; // 0 - це неділя

  const checkStatus = useCallback(async () => {
    try {
      const res = await axios.get(
        `${backendUrl}/api/future-letter/last/${childId}`,
        { withCredentials: true },
      );

      if (res.data.success && res.data.letter) {
        const lastLetter = res.data.letter;
        setOldLetter(lastLetter);

        const lastDate = new Date(lastLetter.createdAt);
        const isWrittenToday = today.toDateString() === lastDate.toDateString();

        if (isSunday) {
          if (isWrittenToday) {
            // Сьогодні неділя, але лист уже написаний -> Закриваємо
            setIsLocked(true);
            setShowOldLetter(false);
          } else {
            // Сьогодні неділя і лист старий -> Відкриваємо для читання
            setIsLocked(false);
            setShowOldLetter(true);
          }
        } else {
          // Сьогодні не неділя -> Завжди закрито
          setIsLocked(true);
          setShowOldLetter(false);
        }
      } else {
        // Листів взагалі немає в базі
        setIsLocked(!isSunday); // Відкриваємо тільки якщо сьогодні неділя
        setShowOldLetter(false);
      }
    } catch (error) {
      console.log("Помилка завантаження:", error.message);
    }
  }, [childId, backendUrl, isSunday]);

  useEffect(() => {
    if (childId) checkStatus();
  }, [childId, checkStatus]);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setIsAnimating(true);
    try {
      const res = await axios.post(
        `${backendUrl}/api/future-letter/save`,
        { childId, content: text },
        { withCredentials: true },
      );

      if (res.data.success) {
        // Після успіху відразу міняємо стан, щоб не чекати перезавантаження
        setTimeout(() => {
          setIsLocked(true);
          setIsAnimating(false);
          setShowOldLetter(false);
          setText("");
        }, 1500);
      }
    } catch (error) {
      alert("Помилка: " + (error.response?.data?.message || "Збій зв'язку"));
      setIsAnimating(false);
    }
  };

  return (
    <div className="flex flex-col items-center bg-white p-10 rounded-[40px] shadow-2xl w-full max-w-2xl mx-auto my-10 border-4 border-indigo-100">
      <h3 className="text-2xl font-black text-indigo-900 mb-6 uppercase text-center">
        {isLocked ? "Твій секрет збережено 🤫" : "Недільне послання ✍️"}
      </h3>

      {/* Показуємо старий лист тільки якщо неділя і він ще не "прочитаний" для написання нового */}
      <AnimatePresence>
        {isSunday && oldLetter && showOldLetter && !isLocked && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: 20 }}
            className="mb-6 p-6 bg-yellow-50 border-2 border-dashed border-yellow-300 rounded-3xl w-full"
          >
            <p className="text-xs text-yellow-600 font-bold uppercase mb-1">
              Лист із минулого:
            </p>
            <p className="text-gray-800 italic text-lg leading-relaxed">
              "{oldLetter.content}"
            </p>
            <button
              onClick={() => setShowOldLetter(false)}
              className="mt-3 text-indigo-600 font-bold text-sm underline cursor-pointer hover:text-indigo-800"
            >
              Прочитав! Написати новий →
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="relative w-[300px] h-[220px] flex items-end justify-center"
        style={{ perspective: "1200px" }}
      >
        <div className="absolute bottom-0 w-full h-[180px] bg-indigo-200 rounded-b-3xl shadow-inner"></div>

        <AnimatePresence>
          {!isLocked && !showOldLetter && (
            <motion.div
              initial={{ y: -120, opacity: 0 }}
              animate={{ y: -20, opacity: 1 }}
              exit={{ y: 80, opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.8 }}
              className="absolute z-10 w-[260px] h-[170px] bg-white shadow-2xl rounded-lg p-4 top-0 border-t-4 border-indigo-400"
            >
              <textarea
                className="w-full h-full border-none outline-none resize-none text-indigo-900 font-medium bg-transparent"
                placeholder="Напиши собі щось на наступний тиждень..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={isAnimating}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div
          className="absolute bottom-0 w-full h-[180px] bg-white z-20 border-t border-indigo-50"
          style={{
            clipPath: "polygon(0 0, 50% 60%, 100% 0, 100% 100%, 0 100%)",
            borderRadius: "0 0 24px 24px",
          }}
        ></div>

        <motion.div
          animate={{
            rotateX: isLocked || isAnimating || showOldLetter ? 180 : 0,
          }}
          transition={{ duration: 0.8 }}
          className="absolute top-[40px] w-full h-[110px] bg-indigo-50 z-30 shadow-md"
          style={{
            clipPath: "polygon(0 0, 50% 100%, 100% 0)",
            transformOrigin: "top",
            backfaceVisibility: "hidden",
          }}
        />
      </div>

      <div className="mt-12 w-full flex justify-center">
        {!isLocked ? (
          !showOldLetter ? (
            <button
              onClick={handleSubmit}
              disabled={!text.trim() || isAnimating}
              className={`bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-10 py-4 rounded-full font-black hover:shadow-2xl transition-all active:scale-95 ${!text.trim() || isAnimating ? "opacity-50 grayscale cursor-not-allowed" : ""}`}
            >
              {isAnimating ? "ЗБЕРІГАЄМО..." : "ПОКЛАСТИ В КОНВЕРТ"}
            </button>
          ) : (
            <p className="text-indigo-400 font-bold italic animate-pulse">
              Прочитай лист вище 👆
            </p>
          )
        ) : (
          <div className="text-center font-bold text-indigo-500">
            <p className="text-xl">Лист надійно сховано! ✨</p>
            <p className="text-sm text-gray-400 mt-1">
              {isSunday
                ? "Ти вже написав лист сьогодні."
                : "Конверт відкриється в неділю."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FutureLetter;
