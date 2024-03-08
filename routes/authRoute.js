// routes/authRoutes.js
import express from "express";
import {
  addUserPhoto,
  login,
  logout,
  registerUser,
} from "../controllers/authController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/login", login);
router.post("/logout", logout);
router.post("/register", authenticateToken, registerUser);

router.post("/addUserPhoto", authenticateToken, addUserPhoto);

export default router;
