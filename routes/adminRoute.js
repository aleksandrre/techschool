// teacherRoute.js
import express from "express";
const router = express.Router();

import { authenticateToken } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/authorizeMiddleware.js";
import { createGroup } from "../controllers/adminController.js";

// Route to get student information with group details
router.post(
  "/create-group",
  authenticateToken,
  authorize(["admin"]),
  createGroup
);

//მასწავლებლის წაშლა

export default router;
