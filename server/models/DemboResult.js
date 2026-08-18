import mongoose from "mongoose";

const demboResultSchema = new mongoose.Schema({
  childId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "child",
    required: true,
  },
  results: {
    health: { type: Number, required: true },
    intelligence: { type: Number, required: true },
    character: { type: Number, required: true },
    happiness: { type: Number, required: true },
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const DemboResult =
  mongoose.models.demboResult ||
  mongoose.model("demboResult", demboResultSchema);
export default DemboResult;
