import goNoGoModel from "../models/goNoGoModel.js";

export const saveGoNoGoResult = async (req, res) => {
  try {
    const { childId } = req.params;
    const data = req.body;

    const newResult = new goNoGoModel({
      childId,
      ...data,
    });

    await newResult.save();
    res.json({ success: true, message: "Результати Go/No-Go збережено" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

export const getGoNoGoHistory = async (req, res) => {
  try {
    const { childId } = req.params;
    const history = await goNoGoModel.find({ childId }).sort({ date: -1 });
    res.json({ success: true, history });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
