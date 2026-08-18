import React, { useEffect, useState, useContext } from "react";
import { moods } from "./MoodConfig";
import axios from "axios";
import { AppContext } from "../context/AppContext";

const MoodCalendar = ({ childId }) => {
  const { backendUrl } = useContext(AppContext);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [history, setHistory] = useState({});

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleString("uk-UA", { month: "long" });
  const formattedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const shift = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: shift }, (_, i) => i);

  useEffect(() => {
    const fetchMoods = async () => {
      try {
        const monthString = String(month + 1).padStart(2, "0");
        const { data } = await axios.get(
          `${backendUrl}/api/child-mood/${childId}/${year}/${monthString}`,
        );

        const mapped = {};
        data.forEach((item) => {
          mapped[item.date] = item.mood;
        });

        setHistory(mapped);
      } catch (err) {
        console.error(err);
      }
    };

    fetchMoods();
  }, [childId, backendUrl, year, month]);

  const changeMonth = (dir) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + dir);
    setCurrentDate(newDate);
  };

  const getMoodForDay = (day) => {
    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return history[dateKey] || null;
  };

  const getEmojiForDay = (day) => {
    const moodId = getMoodForDay(day);
    return moods.find((m) => m.id === moodId)?.emoji || null;
  };

  const getMoodColor = (moodId) => {
    switch (moodId) {
      case "happy":
        return "bg-[#D9EeB9]";
      case "neutral":
        return "bg-yellow-200";
      case "sad":
        return "bg-blue-200";
      case "angry":
        return "bg-red-200";
      case "tired":
        return "bg-purple-200";
      default:
        return "bg-white";
    }
  };

  return (
    <div className="w-full max-h-[85vh] flex flex-col items-center p-2 md:p-4">
      <div className="w-full max-w-[1250px] bg-[#F3F0Ee] backdrop-blur-md rounded-[40px] shadow-2xl border border-white flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
          <button
            onClick={() => changeMonth(-1)}
            className="p-2 hover:scale-110 transition-transform"
          >
            <svg
              width="20"
              height="20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="#2c4832"
              strokeWidth={3}
            >
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <h3 className="text-2xl md:text-3xl font-black text-[#2c4832]">
            {formattedMonth} <span className="font-light">{year}</span>
          </h3>

          <button
            onClick={() => changeMonth(1)}
            className="p-2 hover:scale-110 transition-transform"
          >
            <svg
              width="20"
              height="20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="#2c4832"
              strokeWidth={3}
            >
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="p-4 md:p-6 flex-1">
          <div className="grid grid-cols-7 gap-1 md:gap-3 h-full">
            {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"].map((day) => (
              <div
                key={day}
                className="text-[10px] font-bold uppercase tracking-widest text-[#2c4832] text-center pb-2"
              >
                {day}
              </div>
            ))}

            {blanks.map((i) => (
              <div
                key={`blank-${i}`}
                className="min-h-[60px] md:min-h-[80px]"
              />
            ))}

            {daysArray.map((day) => {
              const moodId = getMoodForDay(day);
              const emoji = getEmojiForDay(day);

              return (
                <div
                  key={day}
                  className={`
                    relative min-h-[70px] md:min-h-[90px] flex items-center justify-center rounded-2xl transition-all duration-300
                    ${
                      moodId
                        ? `${getMoodColor(moodId)} shadow-md border border-gray-50`
                        : "bg-[#fafafa]/50 hover:bg-white"
                    }
                  `}
                >
                  <span className="absolute top-2 left-3 text-xs md:text-sm font-bold text-[#2c4832]">
                    {day}
                  </span>

                  <div className="text-3xl md:text-5xl leading-none">
                    {emoji}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodCalendar;
