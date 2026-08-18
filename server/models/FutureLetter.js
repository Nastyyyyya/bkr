import mongoose from "mongoose";

const futureLetterSchema = new mongoose.Schema({
  childId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Child",
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const FutureLetter = mongoose.model("FutureLetter", futureLetterSchema);

export default FutureLetter;
