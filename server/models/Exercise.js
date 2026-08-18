import mongoose from "mongoose";

const exerciseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    shortDescription: { type: String, required: true },
    fullText: { type: String, required: true },
    image: { type: String }, 
    tags: { type: [String], default: [] }, 
  },
  { timestamps: true },
);

const Exercise = mongoose.model("Exercise", exerciseSchema);

export default Exercise;
