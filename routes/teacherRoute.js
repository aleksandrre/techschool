// studentRoutes.js
import express from "express";
const router = express.Router();
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/authorizeMiddleware.js";
import {
  activateDayStatus,
  addHomeworkFile,
  deleteHomeworkFile,
  writeAttandance,
  writeLaborMark,
  getDayStudentsInfo,
} from "../controllers/teacherController.js";

// Route to get student information with group details
router.post(
  "/groups/:groupId/days/:dayId/activestatus",
  authenticateToken,
  authorize(["teacher"]),
  activateDayStatus
);
router.post(
  "/groups/:groupId/days/:dayId/teacherFilePath",
  authenticateToken,
  authorize(["teacher"]),
  addHomeworkFile
);
router.delete(
  "/groups/:groupId/days/:dayId/teacherFilePath",
  authenticateToken,
  authorize(["teacher"]),
  deleteHomeworkFile
);

router.post(
  "/groups/:groupId/days/:dayId/student/:studentId/writeAttandance",
  authenticateToken,
  authorize(["teacher"]),
  writeAttandance
);
router.post(
  "/groups/:groupId/days/:dayId/student/:studentId/writeLaborMark",
  authenticateToken,
  authorize(["teacher"]),
  writeLaborMark
);

//
router.get(
  "/group/:groupId/day/:dayId/getDayStudentsInfo",
  authenticateToken,
  authorize(["teacher"]),
  getDayStudentsInfo
);

export default router;
