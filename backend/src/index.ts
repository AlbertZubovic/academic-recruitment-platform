import "reflect-metadata";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/users";
import applicationRoutes from "./routes/applicationRoutes";
import courseRoutes from "./routes/courseRoutes";
import { AppDataSource } from "./data-source";
import dotenv from "dotenv";

dotenv.config();

// Set JWT_SECRET if not set from .env
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "thisisasecretkey";
  console.log("JWT_SECRET set to default value");
}

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = ["http://localhost:3000", "http://localhost:5875"];
      console.log(`CORS Request from origin: ${origin}`);
      
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log(`CORS blocked for origin: ${origin}`);
        callback(new Error('CORS Not allowed'));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    preflightContinue: false,
    optionsSuccessStatus: 204
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/courses", courseRoutes);

app.get("/", (_, res) => {
  res.send("API running");
});

AppDataSource.initialize()
  .then(() => {
    app.listen(5000, () => {
      console.log("Server running");
    });
  })
  .catch((error) => console.error(error));

  console.log(typeof authRoutes);