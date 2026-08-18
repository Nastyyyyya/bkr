import ChildMood from "../models/ChildMood.js";
import ChildGarden from "../models/ChildGarden.js";

const calculateGardenState = (moods) => {
  let flowers = 2;
  let treeStage = 0;
  let clouds = 0;
  let rain = false;
  let beaver = false;
  let badStreak = 0;

  for (let i = moods.length - 1; i >= 0; i--) {
    const mood = moods[i].mood;

    if (mood === "happy" || mood === "calm") {
      flowers = Math.min(flowers + 1, 10);
      badStreak = 0;
      clouds = 0;
      rain = false;
      beaver = false;

      if (treeStage < 2) treeStage += 1;
    } else if (mood === "neutral") {
      clouds = 1;
      badStreak += 1;
    } else if (mood === "sad" || mood === "tired") {
      clouds = 2;
      badStreak += 1;
      if (badStreak >= 3) flowers = Math.max(flowers - 1, 0);
    } else if (mood === "angry") {
      clouds = 3;
      rain = true;
      beaver = true;
      flowers = Math.max(flowers - 1, 0);
      badStreak += 1;
    }
  }

  return { flowers, treeStage, clouds, rain, beaver };
};

export const getGarden = async (req, res) => {
  try {
    const { childId } = req.params;
    const moods = await ChildMood.find({ childId }).sort({ date: -1 }).limit(7);

    const state = calculateGardenState(moods);

    const garden = await ChildGarden.findOneAndUpdate(
      { childId },
      { ...state, lastUpdated: new Date() },
      { upsert: true, new: true },
    );

    res.json(garden);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
