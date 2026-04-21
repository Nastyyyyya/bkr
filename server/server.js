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
import exerciseRoutes from "./routes/exerciseRoutes.js";
import luscherRoutes from "./routes/luscherRoutes.js";
import goNoGoRouter from "./routes/goNoGoRoutes.js";
import anxietyRouter from "./routes/anxietyRoutes.js";
import sdqRouter from "./routes/SDQRoute.js";
import wilsonRouter from "./routes/wilsonRoute.js";
import demboRouter from "./routes/demboRoute.js";
import futureLetterRouter from "./routes/futureLetterRoutes.js";
import analyticsRouter from "./routes/analyticsRoute.js";

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

app.use("/api/exercises", exerciseRoutes);
app.use("/api/luscher", luscherRoutes);
app.use("/api/child-go-no-go", goNoGoRouter);
app.use("/api/child-anxiety", anxietyRouter);
app.use("/api/sdq-test", sdqRouter);
app.use("/api/wilson", wilsonRouter);
app.use("/api/dembo", demboRouter);
app.use("/api/future-letter", futureLetterRouter);
app.use("/api/analytics", analyticsRouter);

app.listen(port, () => console.log(`Server started on PORT:${port}`));
