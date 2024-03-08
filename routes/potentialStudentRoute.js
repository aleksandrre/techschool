// routes/authRoutes.js
import express from "express";

import {
  getAllPotentialStudents,
  savePotentialStudent,
} from "../controllers/potentialStudentController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/authorizeMiddleware.js";

const router = express.Router();

router.get(
  "/",
  authenticateToken,
  authorize(["admin"]),
  getAllPotentialStudents
);
router.post("/register", savePotentialStudent);

export default router;
