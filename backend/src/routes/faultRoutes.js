
import express from "express";
import {
  createSession,
  getSessions,
  finishSession
} from "../controllers/faultController.js";

const router = express.Router();

router.post("/create", createSession);
router.get("/", getSessions);
router.put("/finish/:id", finishSession);

export default router;