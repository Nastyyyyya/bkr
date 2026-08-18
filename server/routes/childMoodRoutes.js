import express from "express";
import {
  saveMood,
  getMonthMood,
  hasTodayMood,
  getMoodAnalytics,
} from "../controllers/childMoodController.js";

const router = express.Router();

router.post("/", saveMood);

router.get("/today/:childId", hasTodayMood);

router.get("/:childId/:year/:month", getMonthMood);

router.get("/analytics/:childId", getMoodAnalytics);
export default router;
