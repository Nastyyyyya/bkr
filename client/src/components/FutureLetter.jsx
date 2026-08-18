import React, { useState, useEffect, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import axios from "axios";

const FutureLetter = ({ childId, backendUrl }) => {
  const [text, setText] = useState("");
  const [isLocked, setIsLocked] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [oldLetter, setOldLetter] = useState(null);
  const [showOldLetter, setShowOldLetter] = useState(false);

  const today = new Date();
  const isSunday = today.getDay() === 0;

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
            setIsLocked(true);
            setShowOldLetter(false);
          } else {
            setIsLocked(false);
            setShowOldLetter(true);
          }
        } else {
          setIsLocked(true);
          setShowOldLetter(false);
        }
      } else {
        setIsLocked(!isSunday);
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
    <div className="flex flex-col items-center bg-[#f8f9f5] p-8 sm:p-12 rounded-[40px] shadow-[0_20px_50px_rgba(44,72,50,0.08)] w-full max-w-2xl mx-auto my-10 border border-white select-none overflow-hidden">
      {/* Header */}
      <div className="text-center mb-10">
        <h3 className="text-2xl sm:text-3xl font-black text-[#2c4832] mb-3 uppercase tracking-tight">
          {isLocked ? "Твій твоє послання збережено" : "Недільне послання"}
        </h3>
        <p className="text-[#2c4832]/50 font-medium text-sm text-center">
          {isLocked
            ? "Конверт надійно запечатаний"
            : "Напиши собі кілька теплих слів"}
        </p>
      </div>

      <AnimatePresence>
        {isSunday && oldLetter && showOldLetter && !isLocked && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mb-10 p-8 bg-[#fff9db] border-2 border-dashed border-[#f1c40f]/30 rounded-[30px] w-full shadow-sm relative"
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#f1c40f] text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
              Привіт із минулого
            </div>
            <p className="text-[#2c4832] italic text-lg leading-relaxed text-center font-medium">
              "{oldLetter.content}"
            </p>
            <button
              onClick={() => setShowOldLetter(false)}
              className="mt-6 w-full py-3 bg-[#2c4832] text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-[#1a2e20] transition-colors"
            >
              Прочитав! Написати новий →
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="relative w-[300px] h-[220px] flex items-end justify-center mb-4"
        style={{ perspective: "1200px" }}
      >
        <div className="absolute bottom-0 w-full h-[180px] bg-[#e1e4d8] rounded-b-3xl shadow-inner border border-[#2c4832]/5"></div>

        <AnimatePresence>
          {!isLocked && !showOldLetter && (
            <motion.div
              initial={{ y: -120, opacity: 0 }}
              animate={{ y: -25, opacity: 1 }}
              exit={{ y: 100, opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.8, ease: "circOut" }}
              className="absolute z-10 w-[270px] h-[180px] bg-white shadow-2xl rounded-xl p-5 top-0 border-t-[6px] border-[#2c4832]"
            >
              <textarea
                className="w-full h-full border-none outline-none resize-none text-[#2c4832] font-bold bg-transparent placeholder-[#2c4832]/20 text-sm italic"
                placeholder="Напиши щось важливе собі..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={isAnimating}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div
          className="absolute bottom-0 w-full h-[180px] bg-[#f0f2ea] z-20 border-t border-white/50 shadow-[-5px_-5px_20px_rgba(0,0,0,0.02)]"
          style={{
            clipPath: "polygon(0 0, 50% 60%, 100% 0, 100% 100%, 0 100%)",
            borderRadius: "0 0 24px 24px",
          }}
        ></div>

        <motion.div
          animate={{
            rotateX: isLocked || isAnimating || showOldLetter ? 180 : 0,
          }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute top-[40px] w-full h-[110px] bg-[#d6d9cd] z-30 shadow-md"
          style={{
            clipPath: "polygon(0 0, 50% 100%, 100% 0)",
            transformOrigin: "top",
            backfaceVisibility: "hidden",
            borderTop: "1px solid rgba(255,255,255,0.5)",
          }}
        />
      </div>

      <div className="mt-12 w-full flex justify-center">
        {!isLocked ? (
          !showOldLetter ? (
            <button
              onClick={handleSubmit}
              disabled={!text.trim() || isAnimating}
              className={`relative overflow-hidden bg-[#2c4832] text-white px-12 py-5 rounded-[25px] font-black text-lg transition-all active:scale-95 shadow-[0_15px_30px_rgba(44,72,50,0.2)] ${
                !text.trim() || isAnimating
                  ? "opacity-20 grayscale cursor-not-allowed"
                  : "hover:bg-[#1a2e20]"
              }`}
            >
              {isAnimating ? "ЗАПЕЧАТУЄМО..." : "ПОКЛАСТИ В КОНВЕРТ"}
            </button>
          ) : (
            <div className="flex items-center gap-2 text-[#2c4832]/40 font-black uppercase text-[10px] tracking-widest animate-bounce">
              <span>Прочитай лист вище</span>
              <span className="text-lg"></span>
            </div>
          )
        ) : (
          <div className="text-center animate-in fade-in slide-in-from-bottom-2">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-full mb-4 shadow-sm border border-[#2c4832]/5">
              <span className="text-xl"></span>
            </div>
            <p className="text-[#2c4832] font-black text-xl uppercase tracking-tight">
              Лист надійно сховано!
            </p>
            <p className="text-[#2c4832]/40 text-xs font-bold mt-2 uppercase tracking-widest">
              {isSunday
                ? "Ти вже написав лист сьогодні"
                : "Конверт відкриється в неділю"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FutureLetter;
