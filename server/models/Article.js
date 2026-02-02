import mongoose from "mongoose";

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    image: {
      type: String, // URL картинки
      required: true,
    },
    tags: {
      type: [String], // наприклад ["Ліберальний стиль", "Авторитетний стиль"]
      default: [],
    },
  },
  { timestamps: true },
);

export default mongoose.model("Article", articleSchema);
