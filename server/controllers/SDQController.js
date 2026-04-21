import { SDQModel, SDQResultModel } from "../models/SDQTest.js";

export const getSDQTest = async (req, res) => {
  try {
    const test = await SDQModel.findOne({ name: "SDQ" });
    if (!test)
      return res
        .status(404)
        .json({ success: false, message: "Тест не знайдено" });
    res.json(test);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const saveSDQResult = async (req, res) => {
  const { childId, scores } = req.body;
  try {
    // Офіційні межі для самооцінки (Self-report)
    let status = "Норма (близько до середнього)";
    if (scores.total >= 20)
      status = "Високий рівень труднощів (рекомендовано консультацію)";
    else if (scores.total >= 15)
      status = "Межовий рівень (варто звернути увагу)";

    const newResult = new SDQResultModel({
      childId,
      scores,
      status,
      date: new Date(),
    });

    await newResult.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Додай цей експорт у controllers/SDQController.js
export const getSDQHistory = async (req, res) => {
  try {
    const { childId } = req.params;
    const history = await SDQResultModel.find({ childId }).sort({ date: -1 });
    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
