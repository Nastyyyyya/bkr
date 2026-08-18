import Exercise from "../models/Exercise.js";

export const getExercises = async (req, res) => {
  try {
    const exercises = await Exercise.find();
    res.status(200).json(exercises);
  } catch (err) {
    res.status(500).json({ message: "Помилка сервера", error: err.message });
  }
};

export const getExerciseById = async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise)
      return res.status(404).json({ message: "Вправа не знайдена" });
    res.status(200).json(exercise);
  } catch (err) {
    res.status(500).json({ message: "Помилка сервера", error: err.message });
  }
};

export const createExercise = async (req, res) => {
  try {
    const { title, shortDescription, fullText, image, tags } = req.body;
    const newExercise = new Exercise({
      title,
      shortDescription,
      fullText,
      image,
      tags,
    });
    await newExercise.save();
    res.status(201).json(newExercise);
  } catch (err) {
    res.status(500).json({ message: "Помилка сервера", error: err.message });
  }
};
