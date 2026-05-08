import express from "express";
import { getMonthlyDeepData } from "../controllers/analyticsController.js";

const router = express.Router();

router.get("/monthly/:childId", getMonthlyDeepData);

export default router;
