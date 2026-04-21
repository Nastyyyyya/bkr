import DemboResult from "../models/DemboResult.js";

// Зберегти результати тесту
export const saveDemboResult = async (req, res) => {
  try {
    const { childId, results } = req.body;

    if (!childId || !results) {
      return res.json({
        success: false,
        message: "Відсутні дані для збереження",
      });
    }

    const newResult = new DemboResult({
      childId,
      results,
    });

    await newResult.save();

    res.json({
      success: true,
      message: "Результати тесту Дембо-Рубінштейн збережено! 🎉",
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// Отримати історію тестів дитини (ТА САМА ФУНКЦІЯ, ЯКОЇ НЕ ВИСТАЧАЛО)
export const getDemboResultsByChild = async (req, res) => {
  try {
    const { childId } = req.params;
    const results = await DemboResult.find({ childId }).sort({ date: -1 });
    res.json({ success: true, results });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// Аналітика для батьків (потрібна для компонента ChildOverview)
export const getDemboAnalytics = async (req, res) => {
  try {
    const { childId } = req.params;
    const latestResult = await DemboResult.findOne({ childId }).sort({
      date: -1,
    });

    if (!latestResult) {
      return res.json({ success: false, message: "Дані відсутні" });
    }

    const scales = latestResult.results;
    const insights = [];

    const getLevel = (value) => {
      if (value <= 44) return { label: "низький", crit: true };
      if (value <= 74) return { label: "середній (адекватний)", crit: false };
      if (value <= 89) return { label: "високий", crit: false };
      return { label: "завищений (неадекватний)", crit: true };
    };

    const categories = {
      health: "Здоров'я",
      intelligence: "Розум/Здібності",
      character: "Характер",
      happiness: "Щастя",
    };

    Object.keys(scales).forEach((key) => {
      const level = getLevel(scales[key]);
      let text = `${categories[key]}: ${level.label} рівень.`;

      if (scales[key] <= 44) text += " Потребує підтримки.";
      if (scales[key] >= 90) text += " Ознака ідеалізації.";

      insights.push(text);
    });

    res.json({
      success: true,
      insights,
      data: scales,
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};
