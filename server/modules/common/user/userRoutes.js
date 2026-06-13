import express from "express";
const router = express.Router();
import userController from "./userController.js";

// ✅ POST - Insert or Update User
router.post("/upsert", userController.upsertUser);

// ✅ POST - Login
router.post("/login", userController.login);

// ✅ GET - Developer Projects
router.get("/developer-projects/:userId", userController.getDeveloperProjects);

export default router;
