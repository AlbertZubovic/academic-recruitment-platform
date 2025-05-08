import "reflect-metadata";
import express from "express";
import authRoutes from "./routes/authRoutes";
import { AppDataSource } from "./data-source";

const app = express();
app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/", (_, res) => {
  res.send("API running");
});

AppDataSource.initialize()
  .then(() => {
    app.listen(3000, () => {
      console.log("Server running");
    });
  })
  .catch((error) => console.error(error));

  console.log(typeof authRoutes);