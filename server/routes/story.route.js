import express from "express";
import { verifyUser } from "../utils/verifyUser.js";
import {
  CreateStory,
  editStory,
  getCategoryStories,
  getAllBookmarkedStories,
  getStory,
  getUserStories,
} from "../controllers/story.controller.js";

const router = express.Router();

router.post("/create-story", verifyUser, CreateStory);
router.post("/update-story", verifyUser, editStory);
router.post("/get-story", getStory);
router.get("/get-user-story", verifyUser, getUserStories);
router.get("/get-allbookmarked-stories", verifyUser, getAllBookmarkedStories);
router.get("/get-storyby-category", getCategoryStories);

export default router;
