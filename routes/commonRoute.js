import express from "express";
import {
  downloadFile,
  getGroupAllDayResources,
  getGroupDays,
  getGroupStudents,
  getGroupSyllabus,
  getGroupsInfo,
  getlaborFilePaths,
} from "../controllers/commonController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/authorizeMiddleware.js";

const router = express.Router();

// Common Routes
router.get("/downloadFile", downloadFile);
router.get(
  "/day/:dayId/getlaborFilePaths",
  authenticateToken,
  getlaborFilePaths
);
router.get("/group/:groupId/students", authenticateToken, getGroupStudents);
router.get("/group/:groupId/syllabus", authenticateToken, getGroupSyllabus);
router.get(
  "/group/:groupId/getGroupAllDayResources",
  authenticateToken,
  getGroupAllDayResources
);
router.get("/groupsInfo", authenticateToken, getGroupsInfo);
router.get(
  "/group/:groupId/getGroupDays",
  authenticateToken,
  authorize(["teacher"]),
  getGroupDays
);

export default router;
