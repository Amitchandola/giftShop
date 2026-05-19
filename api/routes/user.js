import express from "express";
import {
  login,
  profile,
  register,
  users,
  guestCheckout,
  updateName,
} from "../controllers/user.js";
import { Authenticated } from "../middlewares/auth.js";

const router = express.Router();

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

// Guest checkout — find or create user
router.post("/guest-checkout", guestCheckout);

export default router;
