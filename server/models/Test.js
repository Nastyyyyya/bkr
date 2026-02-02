import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  block: { type: String, required: true }, // Авторитетний, Авторитарний, Ліберальний
  image: { type: String, default: "" }, // якщо буде картинка
});

const testSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  questions: [questionSchema],
});

export default mongoose.model("Test", testSchema);
