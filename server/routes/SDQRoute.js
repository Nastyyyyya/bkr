// routes/SDQRoute.js
import express from "express";
// ДОДАЙ getSDQHistory сюди в імпорт:
import {
  getSDQTest,
  saveSDQResult,
  getSDQHistory,
} from "../controllers/SDQController.js";

const router = express.Router();

router.get("/get-test", getSDQTest);
router.post("/submit-result", saveSDQResult);
// Тепер цей рядок спрацює:
router.get("/history/:childId", getSDQHistory);

export default router;
