import express from "express";
import {
  addUserPhoto,
  downloadFile,
  getGroupAllDayResources,
  getGroupDays,
  getGroupStudentsTeacher,
  getGroupSyllabus,
  getGroupsInfo,
  getTeacherFilePath,
  getlaborFilePaths,
} from "../controllers/commonController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/authorizeMiddleware.js";

const router = express.Router();

// Common Routes
// getlaborFilePaths - აბრუნებს კონკრეტული დღის კონკრეტული სტუდენტის დავალებებს(დავალებების მისამართებს გვიბრუნებს რომ წაშლისას სტუდენტს შეეძლოს კონკრეტული ფაილის წაშლა )
// getGroupStudentsTeacher- აბრუნებს ჯგუფის მოსწავლეებზე და მასწავლებელზე ინფორმაციას: groupStudents, numberOfStudents, teacher
// getGroupSyllabus - აბრუნებს სილაბუსს
// getGroupAllDayResources - აბრუნებს ყველა დღის რესურს (დღის თემასთან ერთად)
// getGroupsInfo - აბრუნებს გროუფის ძირითად ინფორმაციას main ფეიჯზე
// getGroupDays - აბრუნებს ჯგუფის ყველა დღეს. (day.id - დღის აიდებს)
// addUserPhoto - ამ როუთით ვტვირთავთ და ასევე ვცვლით user - ის profile picture-ს
// getTeacherFilePath - აბრუნებს გასაკეთბელ მასწავლებლის ატვირთულ  დავალებას (ფაილის მისამართს)
router.get("/downloadFile", downloadFile);
router.get(
  "/day/:dayId/getlaborFilePaths",
  authenticateToken,
  getlaborFilePaths
);
router.get(
  "/group/:groupId/students",
  authenticateToken,
  getGroupStudentsTeacher
);
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

router.post("/addUserPhoto", authenticateToken, addUserPhoto);

router.get(
  "/day/:dayId/getTeacherFilePath",
  authenticateToken,
  getTeacherFilePath
);

export default router;
