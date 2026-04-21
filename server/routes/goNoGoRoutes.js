import express from "express";
import {
  saveGoNoGoResult,
  getGoNoGoHistory,
} from "../controllers/goNoGoController.js";

const goNoGoRouter = express.Router();

goNoGoRouter.post("/save/:childId", saveGoNoGoResult);
goNoGoRouter.get("/history/:childId", getGoNoGoHistory);

export default goNoGoRouter;
