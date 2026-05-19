import User from "../models/User.js"; //

import bcrypt from "bcryptjs";

import jwt from "jsonwebtoken";

//register function
export const register = async (req, res) => {
  const { name, email, password } = req.body;
  console.log("Register endpoint called with:", { name, email });
  try {
    const emailNormalized = email.trim().toLowerCase();
    let user = await User.findOne({ email: emailNormalized });
    if (user) {
      console.log("User already exists:", emailNormalized);
      return res.status(400).json({
        message: "User already exists",
        success: false,
      });
    }
    const hashpass = await bcrypt.hash(password, 10);
    user = await User.create({
      name,
      email: emailNormalized,
      password: hashpass,
    });
    console.log("User created:", user);

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
    console.error("Error in register:", error);
    res.status(400).json({ message: error.message });
  }
};

//login function
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const emailNormalized = email.trim().toLowerCase();
    console.log("Login attempt:", emailNormalized);

    const user = await User.findOne({ email: emailNormalized });
    console.log("User found:", user ? user.email : "NOT FOUND");

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
    res.status(400).json({ message: error.message });
  }
};

//get all users function

export const users = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(400).json({ message: error.message });
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
      error: error.message,
    });
  }
};

// Update user name
export const updateName = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }
    const user = await User.findByIdAndUpdate(
      req.user,
      { name: name.trim() },
      { new: true }
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
    let isNewUser = false;

    if (!user) {
      // Auto-create user with a random password
      const randomPass = Math.random().toString(36).slice(-10);
      const hashpass = await bcrypt.hash(randomPass, 10);

      user = await User.create({
        name,
        email: emailNormalized,
        password: hashpass,
      });
      isNewUser = true;
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "365d",
    });

    res.status(200).json({
      success: true,
      message: isNewUser
        ? "Account created successfully"
        : "Welcome back! Proceeding to checkout",
      token,
      isNewUser,
      user: { name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Guest checkout error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
