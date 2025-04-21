import express from "express";
import {
  googleAuth,
  googleCallback,
  appleAuth,
  appleCallback,
  emailSignup,
  emailLogin,
} from "../controllers/authController.js";

const router = express.Router();

// OAuth Routes
router.get("/google", googleAuth);
router.get("/google/callback", googleCallback);
router.get("/apple", appleAuth);
router.get("/apple/callback", appleCallback);

// Email Routes
router.post("/signup", emailSignup);
router.post("/login", emailLogin);

export default router;
