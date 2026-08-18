import mongoose from "mongoose";

const anxietySchema = new mongoose.Schema({
  childId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "child", 
    required: true,
  },
  level: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
  },
  status: {
    type: String,
    required: true, 
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const anxietyModel =
  mongoose.models.anxiety || mongoose.model("anxiety", anxietySchema);
export default anxietyModel;
