import Test from "../models/Test.js";

// Отримати тест PSDQ
export const getPSDQTest = async (req, res) => {
  try {
    const test = await Test.findOne({ name: "PSDQ" });
    if (!test) return res.status(404).json({ message: "Тест не знайдено" });
    res.json(test);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
