import mongoose from "mongoose";

const childMoodSchema = new mongoose.Schema(
  {
    childId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Child",
      required: true,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    mood: {
      type: String,
      enum: ["happy", "calm", "sad", "angry", "anxious"],
      required: true,
    },
  },
  { timestamps: true },
);

// один запис на день
childMoodSchema.index({ childId: 1, date: 1 }, { unique: true });

export default mongoose.model("ChildMood", childMoodSchema);
