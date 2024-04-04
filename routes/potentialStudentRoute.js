// routes/authRoutes.js
import express from "express";

import {
  addPotentialStudent,
  deleteAllPotentialStudents,
  deletePotentialStudent,
  getAllPotentialStudents,
} from "../controllers/potentialStudentController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/authorizeMiddleware.js";

const router = express.Router();
// potentialstudents routes
// getAllPotentialStudents - აბრუნებს ყველა პოტენციურ სტუდენტს
// savePotentialStudent - პოტენციური სტუდენტის რეგისტრაცია (https://techwizards.school.ge -დან)
// deletePotentialStudent - პოტენციური სტუდენტის წაშლა
// deleteAllPotentialStudents - ყველა პოტენციური სტუდენტის წაშლა
router.get(
  "/",
  authenticateToken,
  authorize(["admin"]),
  getAllPotentialStudents
);
router.post("/register", addPotentialStudent);

//გასატესტია
router.delete(
  "/:potentialStudentId/deletePotentialStudent",
  authenticateToken,
  authorize(["admin"]),
  deletePotentialStudent
);

//გასატესტია
router.delete(
  "/deleteAll",
  authenticateToken,
  authorize(["admin"]),
  deleteAllPotentialStudents
); // Define the new DELETE route

export default router;
