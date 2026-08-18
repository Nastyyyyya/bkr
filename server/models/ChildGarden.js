import mongoose from "mongoose";

const childGardenSchema = new mongoose.Schema(
  {
    childId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Child",
      required: true,
      unique: true,
    },
    flowers: { type: Number, default: 2 }, 
    treeStage: { type: Number, default: 0 }, // 0-2
    clouds: { type: Number, default: 0 }, // 0-3
    rain: { type: Boolean, default: false },
    beaver: { type: Boolean, default: false },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export default mongoose.model("ChildGarden", childGardenSchema);
