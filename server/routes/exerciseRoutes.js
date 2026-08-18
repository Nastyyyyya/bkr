import express from "express";
import {
  getExercises,
  getExerciseById,
  createExercise,
} from "../controllers/exerciseController.js";

const router = express.Router();

router.get("/", getExercises);

router.get("/:id", getExerciseById);

router.post("/", createExercise);

export default router;
