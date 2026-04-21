import mongoose from "mongoose";

const exerciseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    shortDescription: { type: String, required: true },
    fullText: { type: String, required: true },
    image: { type: String }, // URL картинки, необов'язково
    tags: { type: [String], default: [] }, // категорії
  },
  { timestamps: true },
);

const Exercise = mongoose.model("Exercise", exerciseSchema);

export default Exercise;
