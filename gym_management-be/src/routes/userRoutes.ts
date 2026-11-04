// src/routes/userRoutes.ts
import express from "express";
import { userController } from "../controllers/userController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/register", userController.registerUser.bind(userController));

router.post("/login", userController.loginUser.bind(userController));

router.get("/coach", userController.getCoach.bind(userController));

router.put("/update/:userId", protect, userController.updateUser.bind(userController));

router.put("/change-password/:userId", protect, userController.changePassword.bind(userController));

router.post('/filter', userController.filterCoaches.bind(userController));
export default router;

