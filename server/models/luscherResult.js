import mongoose from "mongoose";

const luscherResultSchema = new mongoose.Schema(
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
    selection1: { type: [String], required: true },
    selection2: { type: [String], required: true },
    computedCodes: { type: [String], default: [] },
  },
  { timestamps: true },
);

const LuscherResult = mongoose.model("LuscherResult", luscherResultSchema);
export default LuscherResult;
