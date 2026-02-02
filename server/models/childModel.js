import mongoose from "mongoose";

const childSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  },
  { timestamps: true }
);

childSchema.index({ username: 1, parentId: 1 }, { unique: true });

const childModel = mongoose.models.child || mongoose.model("child", childSchema);

export default childModel;
