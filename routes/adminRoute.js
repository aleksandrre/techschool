// teacherRoute.js
import express from "express";
const router = express.Router();

import { authenticateToken } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/authorizeMiddleware.js";
import { createGroup, deleteTeacher } from "../controllers/adminController.js";

//adminRoutes
//createGroup - ჯგუფის შექმნა (უმნიშვნელოვანესი როუთი მის გარეშე )
//deleteTeacher - მასწავლებლის წაშლა
router.post(
  "/create-group",
  authenticateToken,
  authorize(["admin"]),
  createGroup
);
//გასატესტია
router.delete(
  "/group/:groupId/teacher/:teacherId/delte-teacher",
  authenticateToken,
  authorize(["admin"]),
  deleteTeacher
);

export default router;
