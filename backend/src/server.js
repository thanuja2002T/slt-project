import express from "express";
import cors from "cors";

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// 🔥 test route
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// 🔥 sample API
app.get("/api/test", (req, res) => {
  res.json({ message: "API working 🔥" });
});

// 🚀 START SERVER
const PORT = 5000;

app.listen(PORT, () => {
  console.log(`🔥 Server running on http://localhost:${PORT}`);
});