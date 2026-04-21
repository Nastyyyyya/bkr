import express from "express";
import {
  saveLuscherResult,
  getLuscherResults,
  getLatestLuscherForParents,
} from "../controllers/luscherTestController.js";

const router = express.Router();

router.post("/save", saveLuscherResult);
router.get("/:childId", getLuscherResults);
router.get("/latest-parent/:childId", getLatestLuscherForParents);

export default router;
