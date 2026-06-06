import express from "express";
import {
  login,
  profile,
  register,
  users,
  guestCheckout,
  updateName,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  changePassword,
} from "../controllers/user.js";
import { sendOtp } from "../controllers/authController.js";
import { Authenticated } from "../middlewares/auth.js";

const router = express.Router();
// Route to send OTP for registration
router.post("/send-otp", sendOtp);
// Import the register function from the user controller
router.post("/register", register);

// You can also add a login route if needed
router.post("/login", login);

//get all users route
router.get("/all", users);

//user profile route
router.get("/profile", Authenticated, profile);

//update name
router.put("/update-name", Authenticated, updateName);

// Forgot password
router.post("/forgot-password", forgotPassword);

// Verify reset OTP
router.post("/verify-reset-otp", verifyResetOtp);

// Reset password (after OTP verified)
router.post("/reset-password", resetPassword);

// Change password (logged in)
router.put("/change-password", Authenticated, changePassword);

// Guest checkout — find or create user
router.post("/guest-checkout", guestCheckout);

export default router;
