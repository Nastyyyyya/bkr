import MoodModel from "../models/ChildMood.js";
import DemboModel from "../models/DemboResult.js";
import anxietyModel from "../models/anxietyModel.js";
import { SDQResultModel } from "../models/SDQTest.js";
import goNoGoModel from "../models/goNoGoModel.js";

export const getMonthlyDeepData = async (req, res) => {
  try {
    const { childId } = req.params;
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);

    const [moods, dembo, anxiety, sdq, gonogo] = await Promise.all([
      MoodModel.find({ childId, date: { $gte: monthAgo } }),
      DemboModel.find({ childId, date: { $gte: monthAgo } }),
      anxietyModel.find({ childId, date: { $gte: monthAgo } }),
      SDQResultModel.find({ childId, date: { $gte: monthAgo } }),
      goNoGoModel.find({ childId, date: { $gte: monthAgo } }),
    ]);

    res.json({
      success: true,
      data: { moods, dembo, anxiety, sdq, gonogo },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
