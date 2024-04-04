// studentRoutes.js
import express from "express";
const router = express.Router();
import {
  getStudentAllDayHomework,
  getStudentAllDayInfo,
  getStudentDirectDayHomework,
  getStudentActiveDayForDashboard,
  addHomework,
  deleteHomework,
} from "../controllers/studentController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";
// student routes
// addHomework - სტუდენტი ამატებს შესრულებულ დავალებას(ფაილს)
// deleteHomework - სტუდენტი შლის შესრულებულ დავალებას(ფაილს)
// getStudentActiveDayForDashboard - აბრუნებს აქტიური დღის შესახებ ინფორმაციას
// getStudentAllDayInfo - აბრუნებს სტუდენტის ინფორმაციას დღეების მიხედვით (edusoft-ის ბოლო გვერდის მსგავსად)
// getStudentDirectDayHomework - აბრუნებს კონკრეტული დღის გასაკეთბელ და შესრულებულ დავალებას (ფაილის მისამართებს)
// getStudentAllDayHomework - აბრუნებს ყველა დღის გასაკეთბელ და შესრულებულ დავალებას (ფაილის მისამართებს) დღეების მიხედვით

router.post("/days/:dayId/add-labor", authenticateToken, addHomework);

router.delete("/days/:dayId/delete-labor", authenticateToken, deleteHomework);

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

export default router;
