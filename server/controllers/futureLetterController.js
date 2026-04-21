import FutureLetter from "../models/FutureLetter.js";

export const saveLetter = async (req, res) => {
  try {
    const { childId, content } = req.body;

    if (!childId || !content) {
      return res
        .status(400)
        .json({ success: false, message: "Лист порожній!" });
    }

    // ВИДАЛЯЄМО ВСІ ПЕРЕВІРКИ ДАТ. Просто створюємо новий запис.
    const newLetter = new FutureLetter({
      childId,
      content,
      createdAt: new Date(),
    });

    await newLetter.save();
    res.status(201).json({ success: true, message: "Лист збережено!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getLastLetter = async (req, res) => {
  try {
    const { childId } = req.params;
    const letter = await FutureLetter.findOne({ childId })
      .sort({ createdAt: -1 })
      .exec();
    res.json({ success: true, letter });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
