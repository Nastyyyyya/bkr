import WilsonResult from "../models/WilsonResult.js";
import mongoose from "mongoose";

// Збереження результату
export const saveWilsonResult = async (req, res) => {
  try {
    const { childId, selectedId } = req.body;

    if (!childId || !selectedId) {
      return res.json({ success: false, message: "Відсутні дані" });
    }

    const newResult = new WilsonResult({
      childId,
      selectedId,
    });

    await newResult.save();
    res.json({ success: true, message: "Результат збережено" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Отримання історії з конкретним текстом інтерпретації
export const getWilsonHistory = async (req, res) => {
  try {
    const { childId } = req.params;

    // 1. Знаходимо всі записи тестів дитини
    const history = await WilsonResult.find({ childId }).sort({ date: -1 });

    if (!history || history.length === 0) {
      return res.json({ success: true, history: [] });
    }

    // 2. Звертаємося до колекції "tests" за описом (використовуємо прямий запит до БД)
    const testDoc = await mongoose.connection.db
      .collection("tests")
      .findOne({ _id: "wilson_tree_test_01" });

    // 3. Склеюємо результат дитини з описом із масиву interpretations
    const enrichedHistory = history.map((record) => {
      // Шукаємо в масиві об'єкт, де id збігається з обраним selectedId
      const info = testDoc?.interpretations?.find(
        (i) => i.id === Number(record.selectedId),
      );

      return {
        ...record.toObject(),
        interpretation: info || {
          forParents:
            "Опис для цієї позиції (№" +
            record.selectedId +
            ") ще не додано в базу.",
        },
      };
    });

    res.json({ success: true, history: enrichedHistory });
  } catch (error) {
    console.error("Помилка в getWilsonHistory:", error);
    res.json({ success: false, message: error.message });
  }
};
