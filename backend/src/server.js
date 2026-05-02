import express from "express";
import cors from "cors";
import faultRoutes from "./routes/faultRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/fault", faultRoutes);

app.listen(5000, () => {
  console.log("🔥 Server running on http://localhost:5000");
});