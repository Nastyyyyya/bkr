// server/controllers/childController.js
import childModel from "../models/childModel.js";

// Додавання дитини без PIN
export const addChild = async (req, res) => {
  try {
    const parentId = req.userId;
    const { name, username } = req.body;

    if (!name || !username) {
      return res.json({ success: false, message: "Усі поля обовʼязкові" });
    }

    // Перевірка унікального username тільки для цього батька
    const existingChild = await childModel.findOne({ username, parentId });
    if (existingChild) {
      return res.json({
        success: false,
        message: "Такий логін дитини вже існує у вас",
      });
    }

    const child = new childModel({ name, username, parentId });
    await child.save();

    return res.json({ success: true, message: "Дитину успішно додано" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Список дітей
export const getMyChildren = async (req, res) => {
  try {
    const parentId = req.userId;
    const children = await childModel.find({ parentId }).select("-pin");
    return res.json({ success: true, children });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Дані конкретної дитини
export const getChildById = async (req, res) => {
  try {
    const { childId } = req.params;
    const parentId = req.userId;

    const child = await childModel
      .findOne({ _id: childId, parentId })
      .select("-pin");
    if (!child)
      return res.json({
        success: false,
        message: "Дитину не знайдено або у вас немає доступу",
      });

    return res.json({ success: true, child });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
