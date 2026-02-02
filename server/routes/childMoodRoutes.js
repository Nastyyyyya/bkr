import express from "express";
import {
  saveMood,
  getMonthMood,
  hasTodayMood,
} from "../controllers/childMoodController.js";

const router = express.Router();

// Зберегти настрій
router.post("/", saveMood);

// Перевірити, чи є настрій сьогодні
router.get("/today/:childId", hasTodayMood);

// Отримати настрій за місяць
router.get("/:childId/:year/:month", getMonthMood);

export default router;
