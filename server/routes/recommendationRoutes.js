import express from "express";
import { getRecommendedArticles } from "../controllers/recommendationController.js";

const router = express.Router();

router.get("/", getRecommendedArticles);

export default router;
