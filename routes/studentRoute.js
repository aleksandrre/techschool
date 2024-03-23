// studentRoutes.js
import express from "express";
const router = express.Router();
import {
  addLaborToDay,
  deleteLaborFromDay,
  getStudentAllDayHomework,
  getStudentAllDayInfo,
  getStudentDirectDayHomework,
  getStudentActiveDayForDashboard,
  getTeacherFilePath,
} from "../controllers/studentController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

// Route to get student information with group details

router.post("/days/:dayId/add-labor", authenticateToken, addLaborToDay);

router.delete(
  "/days/:dayId/delete-labor",
  authenticateToken,
  deleteLaborFromDay
);

router.get(
  "/group/:groupId/activeDay",
  authenticateToken,
  getStudentActiveDayForDashboard
);

router.get(
  "/group/:groupId/alldayinfo",
  authenticateToken,
  getStudentAllDayInfo
);

router.get(
  "/group/:groupId/day/:dayId/getStudentDirectDayHomework",
  authenticateToken,
  getStudentDirectDayHomework
);
router.get(
  "/group/:groupId/getStudentAllDayHomework",
  authenticateToken,
  getStudentAllDayHomework
);
router.get(
  "/day/:dayId/getTeacherFilePath",
  authenticateToken,
  getTeacherFilePath
);

export default router;
