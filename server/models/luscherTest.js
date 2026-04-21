import mongoose from "mongoose";

const luscherTestSchema = new mongoose.Schema({
  code: { type: String, required: true }, // +0, x2, =4, -3
  group: { type: String }, // ++, x, =, -
  order: { type: Number }, // позиція у виборі
  interpretation: {
    general: { type: String },
    parents: { type: String },
    children: { type: String },
  },
});

const LuscherTest = mongoose.model("luscher-test", luscherTestSchema);

export default LuscherTest;
