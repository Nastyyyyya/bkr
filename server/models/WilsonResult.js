import mongoose from "mongoose";

const wilsonResultSchema = new mongoose.Schema({
  childId: { type: mongoose.Schema.Types.ObjectId, ref: 'child', required: true },
  selectedId: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

const WilsonResult = mongoose.models.wilsonResult || mongoose.model("wilsonResult", wilsonResultSchema);
export default WilsonResult;