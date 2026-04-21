import express from "express";
import { getMonthlyDeepData } from "../controllers/analyticsController.js";

const router = express.Router();

// ВАЖЛИВО: Тут має бути ТІЛЬКИ '/monthly/:childId'
// НЕ '/api/analytics/monthly/:childId', бо цей префікс уже додано в server.js
router.get("/monthly/:childId", getMonthlyDeepData);

export default router;
