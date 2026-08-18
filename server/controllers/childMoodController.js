import ChildMood from "../models/ChildMood.js";

const getToday = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const saveMood = async (req, res) => {
  try {
    const { childId, mood } = req.body;
    const today = getToday();

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

export const hasTodayMood = async (req, res) => {
  try {
    const { childId } = req.params;
    const today = getToday();

    const mood = await ChildMood.findOne({ childId, date: today });

    res.json({
      hasMood: !!mood,
      mood: mood?.mood || null,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMoodAnalytics = async (req, res) => {
  try {
    const { childId } = req.params;
    const moods = await ChildMood.find({ childId })
      .sort({ date: -1 })
      .limit(14);

    if (moods.length < 3) {
      return res.json({
        success: true,
        insight:
          "Збираємо перші дані для аналізу. Завітайте сюди через кілька днів.",
      });
    }

    const moodWeights = { happy: 5, neutral: 4, tired: 3, sad: 2, angry: 1 };
    const scores = moods.map((m) => moodWeights[m.mood]).reverse(); 

    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;

    const mid = Math.floor(scores.length / 2);
    const firstHalf = scores.slice(0, mid);
    const secondHalf = scores.slice(mid);
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    const variance = Math.max(...scores) - Math.min(...scores);

    let insight = "";

    if (secondAvg > firstAvg + 0.5) {
      insight =
        "Позитивна динаміка: Останніми днями емоційний стан дитини покращується. Вона стає більш відкритою та енергійною.";
    } else if (secondAvg < firstAvg - 0.5) {
      insight =
        "Увага: Спостерігається спад настрою порівняно з початком періоду. Можливо, накопичилася втома або є прихований стрес.";
    } else if (variance >= 3) {
      insight =
        "Емоційні гойдалки: Настрій дитини дуже нестабільний (від радості до гніву). Це може свідчити про адаптацію до нових обставин або гормональні зміни.";
    } else if (avg >= 4.5) {
      insight =
        "Стабільно високий ресурс: Дитина перебуває у гармонійному стані. Це найкращий час для складних завдань та творчості.";
    } else if (avg <= 2.5) {
      insight =
        "Критично низький ресурс: Дитина тривалий час перебуває у пригніченому стані. Рекомендуємо приділити більше уваги відпочинку та емоційній підтримці.";
    } else {
      insight =
        "Рівний фон: Емоційний стан дитини стабільний, без різких стрибків. Вона почувається задовільно.";
    }

    const lastThree = moods.slice(0, 3).map((m) => m.mood);
    if (lastThree.filter((m) => m === "angry").length >= 2) {
      insight +=
        " Зверніть увагу: останнім часом дитина часто відчуває роздратування.";
    }
    if (lastThree.filter((m) => m === "tired").length >= 2) {
      insight += " Важливо: помічено ознаки сильної перевтоми.";
    }

    res.json({ success: true, insight, avgScore: avg });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
