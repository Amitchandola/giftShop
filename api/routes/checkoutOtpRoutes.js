import express from "express";
import {
  sendCheckoutOtp,
  verifyCheckoutOtp,
} from "../controllers/checkoutOtpController.js";

const router = express.Router();

router.post("/send", sendCheckoutOtp);
router.post("/verify", verifyCheckoutOtp);

export default router;
