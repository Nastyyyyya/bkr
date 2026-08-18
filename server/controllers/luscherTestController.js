import LuscherResult from "../models/luscherResult.js";
import mongoose from "mongoose";

const LuscherData = mongoose.model(
  "LuscherData",
  new mongoose.Schema({}, { strict: false }),
  "luscher-test",
);

const getToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
};

const computeCodes = (sel2) => {
  return [
    `+${sel2[0]}+${sel2[1]}`,
    `x${sel2[2]}x${sel2[3]}`,
    `=${sel2[4]}=${sel2[5]}`,
    `-${sel2[6]}-${sel2[7]}`,
  ];
};

export const saveLuscherResult = async (req, res) => {
  try {
    const { childId, selection1, selection2 } = req.body;

    if (!childId || !selection1 || !selection2) {
      return res.status(400).json({ success: false, message: "Дані відсутні" });
    }

    const computedCodes = computeCodes(selection2);

    const resultsFromDb = await LuscherData.find({
      code: { $in: computedCodes },
    });

    const interpretation = computedCodes
      .map(
        (key) =>
          resultsFromDb.find((r) => r.code === key)?.interpretation?.children,
      )
      .filter(Boolean);

    await LuscherResult.create({
      childId,
      selection1,
      selection2,
      computedCodes,
      date: getToday(),
    });

    res.status(200).json({
      success: true,
      interpretation,
    });
  } catch (err) {
    console.error("Luscher Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getLuscherResults = async (req, res) => {
  try {
    const { childId } = req.params;
    const results = await LuscherResult.find({ childId }).sort({
      createdAt: -1,
    });
    res.status(200).json({ success: true, results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getLatestLuscherForParents = async (req, res) => {
  try {
    const { childId } = req.params;

    const latestResult = await LuscherResult.findOne({ childId })
      .sort({ createdAt: -1 })
      .lean();

    if (!latestResult) {
      return res.status(200).json({ success: true, result: null });
    }

    const interpretationsFromDb = await LuscherData.find({
      code: { $in: latestResult.computedCodes },
    });

    const parentInterpretations = latestResult.computedCodes
      .map((code) => {
        const found = interpretationsFromDb.find((item) => item.code === code);
        return found ? found.interpretation?.parents : null;
      })
      .filter(Boolean);

    res.status(200).json({
      success: true,
      result: {
        ...latestResult,
        parentInterpretations,
      },
    });
  } catch (err) {
    console.error("Error fetching latest Luscher:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
