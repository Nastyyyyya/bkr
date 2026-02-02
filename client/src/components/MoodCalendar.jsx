import React, { useEffect, useState, useContext } from "react";
import { moods } from "./MoodConfig";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import "./MoodCalendar.css"; // підключили стилі

const MoodCalendar = ({ childId }) => {
  const { backendUrl } = useContext(AppContext);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [history, setHistory] = useState({});

  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const daysInMonth = new Date(year, Number(month), 0).getDate();

  useEffect(() => {
    const fetchMoods = async () => {
      try {
        const { data } = await axios.get(
          `${backendUrl}/api/child-mood/${childId}/${year}/${month}`,
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

  const getEmojiForDay = (day) => {
    const dateKey = `${year}-${month}-${String(day).padStart(2, "0")}`;
    const moodId = history[dateKey];
    return moods.find((m) => m.id === moodId)?.emoji || "";
  };

  return (
    <div className="mood-calendar-container container">
      <div className="mood-calendar">
        <div className="calendar-header">
          <button onClick={() => changeMonth(-1)}>←</button>
          <h3>
            {currentDate.toLocaleString("uk-UA", { month: "long" })} {year}
          </h3>
          <button onClick={() => changeMonth(1)}>→</button>
        </div>

        <div className="calendar-grid">
          {Array.from({ length: daysInMonth }).map((_, i) => (
            <div key={i} className="calendar-day">
              {getEmojiForDay(i + 1)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MoodCalendar;
