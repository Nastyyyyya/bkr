import express from "express";
import { getPSDQTest } from "../controllers/testController.js";

const router = express.Router();

router.get("/psdq", getPSDQTest);

export default router;
