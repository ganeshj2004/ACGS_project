import express from "express";
import userProjectController from "./userProjectController.js";

const router = express.Router();

router.post("/upsert", userProjectController.upsertUserProject);

export default router;
