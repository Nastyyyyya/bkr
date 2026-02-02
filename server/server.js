import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";

import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import childRoutes from "./routes/childRoutes.js";
import articleRoutes from "./routes/articleRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import recommendationRoutes from "./routes/recommendationRoutes.js";
import childMoodRoutes from "./routes/childMoodRoutes.js";
import childGardenRoutes from "./routes/childGardenRoutes.js";

const app = express();
const port = process.env.PORT || 4000;

connectDB();

const allowedOrigins = ["http://localhost:5173"];

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: allowedOrigins, credentials: true }));

app.get("/", (req, res) => res.send("API working"));

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/child", childRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/recommendations", recommendationRoutes);

app.use("/api/child-mood", childMoodRoutes);
app.use("/api/child-garden", childGardenRoutes);

app.listen(port, () => console.log(`Server started on PORT:${port}`));
