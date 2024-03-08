// studentRoutes.js
import express from "express";
const router = express.Router();
import {
  addLaborToDay,
  deleteLaborFromDay,
  getAllDayHomework,
  getGroupAllDayInfo,
  getGroupDirectDayHomework,
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

router.get("/group/:groupId/alldayinfo", authenticateToken, getGroupAllDayInfo);

router.get(
  "/group/:groupId/day/:dayId/getGroupDirectDayHomework",
  authenticateToken,
  getGroupDirectDayHomework
);
router.get(
  "/group/:groupId/getAllDayHomework",
  authenticateToken,
  getAllDayHomework
);
router.get(
  "/day/:dayId/getTeacherFilePath",
  authenticateToken,
  getTeacherFilePath
);

export default router;
