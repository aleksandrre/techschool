// studentRoutes.js
import express from "express";
const router = express.Router();
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/authorizeMiddleware.js";
import {
  activateDayStatus,
  writeAttandance,
  writeLaborMark,
  getDayStudentsInfo,
  updatesyllabus,
  deletestudent,
  addresource,
  deleteresource,
  addTeacherHomeworkFile,
  deleteTeacherHomeworkFile,
} from "../controllers/teacherController.js";

// teacher routes
// activateDayStatus - მასწავლებელი მონიშნავს აქტიურ დღეს. დღეების dayStatus რომლებიც მაქამდე არიან დაგენერირდება as "past",შემდეგების as "future" და ამ დღის as "active"
// addHomeworkFile - გასაკეთებელი დავალების ატვირთვა
// deleteHomeworkFile - გასაკეთებელი დავალების წაშლა
// writeAttandance - დასწრების დაწერა
// writeLaborMark - ქულის დაწერა
// getDayStudentsInfo - აბრუნებს კონკრეტულ დღის ინფორმაციას, ყველა მოსწავლის შესახებ და ამ დღის გასაკეთებელ დავალებას
// updatesyllabus - შეგვიძლია შევცვალოთ დღის თემა.(შევცვალოთ სილაბუსი)
// deletestudent - მოსწავლის წაშლა
// addresource - რესურსის დამატება
// deleteresource - რესურსის წაშლა
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
  addTeacherHomeworkFile
);
router.delete(
  "/groups/:groupId/days/:dayId/teacherFilePath",
  authenticateToken,
  authorize(["teacher"]),
  deleteTeacherHomeworkFile
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
  "/groups/:groupId/day/:dayId/getDayStudentsInfo",
  authenticateToken,
  authorize(["teacher"]),
  getDayStudentsInfo
);

//this is not tested
router.put("/groups/:groupId/day/:dayId/update-syllabus", updatesyllabus);

//this is not tested
router.delete(
  "/groups/:groupId/student/:studentId/deletestudent",
  authenticateToken,
  authorize(["teacher"]),
  deletestudent
);
//this is not tested
router.post(
  "days/:dayId/addresource",
  authenticateToken,
  authorize(["teacher"]),
  addresource
);
//this is not tested
router.delete(
  "/days/:dayId/deleteresource",
  authenticateToken,
  authorize(["teacher"]),
  deleteresource
);
export default router;
