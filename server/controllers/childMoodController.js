import ChildMood from "../models/ChildMood.js";

// Отримати локальну дату у форматі YYYY-MM-DD
const getToday = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Зберегти настрій дитини
export const saveMood = async (req, res) => {
  try {
    const { childId, mood } = req.body;
    const today = getToday();

    // Перевірка, чи вже збережено настрій сьогодні
    const existing = await ChildMood.findOne({ childId, date: today });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Mood already saved today", mood: existing.mood });
    }

    const newMood = await ChildMood.create({
      childId,
      mood,
      date: today,
    });

    res.status(201).json(newMood);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Отримати настрій дитини за конкретний місяць
export const getMonthMood = async (req, res) => {
  try {
    const { childId, year, month } = req.params;

    const y = Number(year);
    const m = Number(month); // 1-12
    const lastDay = new Date(y, m, 0).getDate();

    const start = `${y}-${String(m).padStart(2, "0")}-01`;
    const end = `${y}-${String(m).padStart(2, "0")}-${lastDay}`;

    const moods = await ChildMood.find({
      childId,
      date: { $gte: start, $lte: end },
    });

    res.json(moods);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Перевірка, чи є настрій на сьогодні + повертаємо його
export const hasTodayMood = async (req, res) => {
  try {
    const { childId } = req.params;
    const today = getToday();

    const mood = await ChildMood.findOne({ childId, date: today });

    res.json({
      hasMood: !!mood,
      mood: mood?.mood || null, // це потрібно для ChildHome.jsx
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
