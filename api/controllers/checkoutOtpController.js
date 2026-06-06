import Otp from "../models/Otp.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import sendOtpMail from "../utils/sendOtpMail.js";

export const sendCheckoutOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email required" });
    }

    const emailNormalized = email.trim().toLowerCase();

    // Send OTP to any email — works for both new and existing users
    await Otp.deleteMany({ email: emailNormalized });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await Otp.create({
      email: emailNormalized,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    await sendOtpMail(emailNormalized, otp);

    return res.status(200).json({
      success: true,
      message: "OTP sent to email",
    });

  } catch (error) {
    console.error("Send OTP failed:", error.name || "Unknown error");
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// VERIFY OTP (Checkout) — login existing user or register new one
export const verifyCheckoutOtp = async (req, res) => {
  try {
    const { email, otp, name, phone } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP required",
      });
    }

    const emailNormalized = email.trim().toLowerCase();
    const otpRecord = await Otp.findOne({ email: emailNormalized });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "OTP already used or expired",
      });
    }

    if (otpRecord.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    if (otpRecord.otp !== otp.trim()) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    // OTP is valid — delete it
    await Otp.deleteOne({ email: emailNormalized });

    // Check if user already exists
    let user = await User.findOne({ email: emailNormalized });
    let isNewUser = false;

    if (!user) {
      // Register new user (no password, OTP-verified)
      if (!name) {
        return res.status(400).json({
          success: false,
          message: "Name is required for new users",
        });
      }
      user = await User.create({
        name: name.trim(),
        email: emailNormalized,
        phone: phone || "",
        password: null,
        isGuest: true,
      });
      isNewUser = true;
    }

    // Generate token (login)
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "365d",
    });

    return res.status(200).json({
      success: true,
      message: isNewUser ? "Account created & logged in" : `Welcome back, ${user.name}!`,
      token,
      user: { _id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin },
      isNewUser,
    });

  } catch (error) {
    console.error("OTP verify failed:", error.name || "Unknown error");
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};