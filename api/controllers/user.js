import User from "../models/User.js";
import Otp from "../models/Otp.js";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

//register function
export const register = async (req, res) => {
  const { name, email, password, otp } = req.body;
  console.log("Register endpoint called with:", { name, email });
  try {
    // check require fields
    if (!name || !email || !password || !otp)
       {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }
       //  password length check (FIXED PLACE)
    if (password.length < 5) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 5 characters",
      });
    }
    // Normalize email and check if user already exists
    const emailNormalized = email.trim().toLowerCase();
    //check existing user
    let user = await User.findOne({ email: emailNormalized });
    if (user) {
      console.log("User already exists:", emailNormalized);
      return res.status(400).json({
        message: "User already exists",
        success: false,
      });
    }
    // Find otp in DB
    const otpData = await Otp.findOne({ email: emailNormalized });
    //Otp not found
    if (!otpData) {
      return res.status(400).json({
        message: "OTP not found. Please request a new one.",
        success: false,
      });
    }
    // Check if OTP is expired
    if (otpData.expiresAt < new Date()) {
      return res.status(400).json({
        message: "OTP has expired. Please request a new one.",
        success: false,
      });
    }
    //Otp mismatch
    if (otpData.otp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP",
        success: false,
      });
    }
    const hashpass = await bcrypt.hash(password, 10);
    user = await User.create({
      name,
      email: emailNormalized,
      password: hashpass,
    });
    console.log("User created:", user.email);

    // Delete OTP after successful registration
    await Otp.deleteMany({ email: emailNormalized });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "365d",
    });

    const { password: _, ...userData } = user._doc;
    res.status(201).json({
      message: "User registered successfully",
      success: true,
      user: userData,
      token,
    });
  } catch (error) {
    console.error("Registration error:", error.name || "Unknown");
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

//login function
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const emailNormalized = email.trim().toLowerCase();

    const user = await User.findOne({ email: emailNormalized });

    if (!user)
      return res.status(404).json({
        message: "User not found",
        success: false,
      });

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword)
      return res.status(401).json({
        message: "Invalid credentials",
        success: false,
      });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "365d",
    });

    // const { password: _, ...userData } = user._doc;

    res.status(200).json({
      message: `Welcome back, ${user.name}!`,
      token,

      success: true,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

//get all users function

export const users = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

//get profile

// export const profile = async (req, res) => {
//   res.status(200).json({
//     user: req.user,
//   });
// };
export const profile = async (req, res) => {
  try {
    const user = await User.findById(req.user).select("-password");

    res.status(200).json({
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get profile",
    });
  }
};

// Update user name
export const updateName = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Name is required" });
    }
    const user = await User.findByIdAndUpdate(
      req.user,
      { name: name.trim() },
      { returnDocument: "after" },
    ).select("-password");
    res.json({ success: true, message: "Name updated", user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update name" });
  }
};

// Guest checkout — find existing user or create new one
export const guestCheckout = async (req, res) => {
  const { name, email, phone } = req.body;

  try {
    if (!email || !phone || !name) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and phone are required",
      });
    }

    const emailNormalized = email.trim().toLowerCase();

    let user = await User.findOne({ email: emailNormalized });

    if (!user) {
      user = await User.create({
        name,
        email: emailNormalized,
      password: null,
  isGuest: true,
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "365d",
    });

    return res.status(200).json({
      success: true,
      token,
      user,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// Forgot Password — send reset link via email
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const emailNormalized = email.trim().toLowerCase();
    const user = await User.findOne({ email: emailNormalized });
    if (!user) {
      return res.status(404).json({ success: false, message: "No account found with this email" });
    }

    // Generate a reset token valid for 15 minutes
    const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });

    // Build reset URL
    const baseUrl = process.env.CLIENT_URL || `${req.protocol}://${req.get("host")}`;
    const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;

    // Send email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: emailNormalized,
      subject: "Password Reset - House of Return Gift",
      html: `
        <div style="font-family:sans-serif;padding:20px;max-width:500px;margin:auto">
          <h2 style="color:#f59e0b">Password Reset</h2>
          <p>Hi ${user.name},</p>
          <p>You requested to reset your password. Click the button below:</p>
          <a href="${resetLink}" style="display:inline-block;background:#f59e0b;color:#000;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0">Reset Password</a>
          <p style="color:#666;font-size:12px">This link expires in 15 minutes. If you didn't request this, ignore this email.</p>
        </div>
      `,
    });

    res.json({ success: true, message: "Password reset link sent to your email" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to send reset email" });
  }
};

// Reset Password — verify token and set new password
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ success: false, message: "Token and new password are required" });
    }
    if (password.length < 5) {
      return res.status(400).json({ success: false, message: "Password must be at least 5 characters" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({ success: false, message: "Reset link has expired. Please request a new one." });
    }
    res.status(400).json({ success: false, message: "Invalid or expired reset link" });
  }
};

// Change Password (logged in user)
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Current and new password are required" });
    }
    if (newPassword.length < 5) {
      return res.status(400).json({ success: false, message: "New password must be at least 5 characters" });
    }

    const user = await User.findById(req.user);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to change password" });
  }
};