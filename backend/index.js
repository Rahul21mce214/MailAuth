import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./db/connectDB.js";
import authRoutes from "./routes/auth_route.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;
const __dirname = path.resolve();

app.use(cors({ credentials: true, origin: "http://localhost:5173" }));

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  });
}

app.listen(port, () => {
  connectDB();
  console.log(`Server listening on port ${port}`);
});
