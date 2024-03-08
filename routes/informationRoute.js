// // routes/authRoutes.js
// import express from "express";
// import { getAllGroups } from "../controllers/infromationController.js";
// import { authenticateToken } from "../middlewares/authMiddleware.js";
// import { authorize } from "../middlewares/authorizeMiddleware.js";

// const router = express.Router();

// router.get(
//   "/group",
//   authenticateToken,
//   authorize(["teacher", "admin"]),
//   getAllGroups
// );

// export default router;
