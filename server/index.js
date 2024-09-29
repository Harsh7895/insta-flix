import mongoose from "mongoose";
import express from "express";
import { configDotenv } from "dotenv";
import AuthRouter from "./routes/auth.route.js";
import UserRouter from "./routes/user.route.js";
import StoryRouter from "./routes/story.route.js";
import cors from "cors";

configDotenv();

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173", "https://insta-flix.vercel.app"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"],
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("Hello world");
});

mongoose
  .connect(process.env.MONGO_DB_URI)
  .then(() => console.log("Database connected"))
  .catch((err) => console.log(err));

app.listen(3000, () => console.log("Server is running on port 3000"));

app.use("/api/v1/auth", AuthRouter);
app.use("/api/v1/user", UserRouter);
app.use("/api/v1/story", StoryRouter);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});
