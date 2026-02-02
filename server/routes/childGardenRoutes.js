import express from "express";
import { getGarden } from "../controllers/childGardenController.js";

const router = express.Router();

router.get("/:childId", getGarden);

export default router;
