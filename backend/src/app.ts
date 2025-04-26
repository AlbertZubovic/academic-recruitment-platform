import "reflect-metadata";
import express from "express";
import { AppDataSource } from "./data-source";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend Server is running");
});

AppDataSource.initialize()
  .then(() => {
    console.log("Connected to Cloud MySQL database");

    app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database connection error:", error);
  });
