import express from "express";
import {
  getSDQTest,
  saveSDQResult,
  getSDQHistory,
} from "../controllers/SDQController.js";

const router = express.Router();

router.get("/get-test", getSDQTest);
router.post("/submit-result", saveSDQResult);
router.get("/history/:childId", getSDQHistory);

export default router;
