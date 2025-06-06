import "reflect-metadata";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import { AppDataSource } from "./data-source";

// Route imports
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import applicationRoutes from "./routes/applicationRoutes";
import courseRoutes from "./routes/courseRoutes";
import candidateRoutes from "./routes/candidateRoutes";   
import lecturerRoutes from "./routes/lecturerRoutes";     
import metricsRoutes from "./routes/metricsRoutes";       
import bookmarkRoutes from "./routes/bookmarkRoutes";

dotenv.config();

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "thisisasecretkey";
  console.log("JWT_SECRET set to default value");
}

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5875"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

// Register all route prefixes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/courses", courseRoutes);

app.use("/api/candidates", candidateRoutes);

app.use("/api/lecturer", lecturerRoutes);
app.use("/api/metrics", metricsRoutes);
app.use("/api/bookmarks", bookmarkRoutes);

app.get("/", (_req, res) => {
  res.send("API running");
});

AppDataSource.initialize()
  .then(() => {
    app.listen(5000, () => {
      console.log("Server running on port 5000");
    });
  })
  .catch((error) => console.error("DB connection error:", error));
