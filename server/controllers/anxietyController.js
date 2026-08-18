import anxietyModel from "../models/anxietyModel.js";

export const saveAnxietyResult = async (req, res) => {
  try {
    const { childId } = req.params;
    const { level } = req.body;

    let status = "Спокій";
    let advice = "Дитина почувається у безпеці.";

    if (level >= 9) {
      status = "Паніка";
      advice = "Потрібна негайна підтримка дорослого та дихальні вправи.";
    } else if (level >= 7) {
      status = "Сильна тривога";
      advice = "Варто відволікти дитину та обговорити причину стресу.";
    } else if (level >= 5) {
      status = "Помірна тривога";
      advice = "Дитина чимось занепокоєна. Спокійна розмова допоможе.";
    } else if (level >= 3) {
      status = "Легке хвилювання";
      advice = "Природний рівень активності або легка непевність.";
    }

    const newEntry = new anxietyModel({
      childId,
      level,
      status,
      advice,
    });

    await newEntry.save();
    res.json({ success: true, message: "Дані термометра збережено" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAnxietyHistory = async (req, res) => {
  try {
    const { childId } = req.params;
    const history = await anxietyModel
      .find({ childId })
      .sort({ date: -1 })
      .limit(10);
    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
