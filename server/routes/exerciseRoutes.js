import express from "express";
import {
  getExercises,
  getExerciseById,
  createExercise,
} from "../controllers/exerciseController.js";

const router = express.Router();

// GET всі вправи
router.get("/", getExercises);

// GET вправу по id
router.get("/:id", getExerciseById);

// POST створити нову вправу
router.post("/", createExercise);

export default router;
