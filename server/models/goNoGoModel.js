import mongoose from "mongoose";

const goNoGoSchema = new mongoose.Schema({
  childId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Child",
    required: true,
  },
  hits: { type: Number, required: true },
  misses: { type: Number, required: true },
  falseAlarms: { type: Number, required: true },
  goTrials: { type: Number, required: true },
  noGoTrials: { type: Number, required: true },
  avgReactionTime: { type: Number, required: true },
  hitRate: { type: Number, required: true },
  falseAlarmRate: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

const goNoGoModel =
  mongoose.models.gonogo || mongoose.model("gonogo", goNoGoSchema);
export default goNoGoModel;
