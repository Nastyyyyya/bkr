import express from "express";
import {
  saveAnxietyResult,
  getAnxietyHistory,
} from "../controllers/anxietyController.js";

const anxietyRouter = express.Router();

anxietyRouter.post("/:childId", saveAnxietyResult);
anxietyRouter.get("/history/:childId", getAnxietyHistory);

export default anxietyRouter;
