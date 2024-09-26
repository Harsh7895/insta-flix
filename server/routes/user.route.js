import express from "express";
import { verifyUser } from "../utils/verifyUser.js";
import {
  toggleBookmarkStory,
  toggleLikeStory,
} from "../controllers/user.controller.js";

const router = express.Router();

router.post("/bookmark-toggle", verifyUser, toggleBookmarkStory);
router.post("/like-toggle", verifyUser, toggleLikeStory);

export default router;
