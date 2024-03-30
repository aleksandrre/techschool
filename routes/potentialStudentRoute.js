// routes/authRoutes.js
import express from "express";

import {
  deleteAllPotentialStudents,
  deletePotentialStudent,
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

//გასატესტია
router.delete(
  "/:potentialStudentId/deletePotentialStudent",
  deletePotentialStudent
);

//გასატესტია
router.delete("/deleteAll", deleteAllPotentialStudents); // Define the new DELETE route

export default router;
