import express from "express";
import {
  loginUser,
  logout,
  registerUser,
} from "../controllers/auth.controller.js";
import { verifyUser } from "../utils/verifyUser.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", verifyUser, logout);

export default router;
