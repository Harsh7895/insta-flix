import express from "express";
import { verifyUser } from "../utils/verifyUser.js";
import {
  CreateStory,
  getStory,
  getUserStories,
} from "../controllers/story.controller.js";

const router = express.Router();

router.post("/create-story", verifyUser, CreateStory);
router.post("/get-story", getStory);
router.get("/get-user-story", verifyUser, getUserStories);

export default router;
