import express from "express";
import {
  addChild,
  getMyChildren,
  getChildById,
} from "../controllers/childController.js";
import userAuth from "../middleware/userAuth.js";

const router = express.Router();

router.post("/add", userAuth, addChild);
router.get("/my", userAuth, getMyChildren);
router.get("/:childId", userAuth, getChildById);

export default router;
