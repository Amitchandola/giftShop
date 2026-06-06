import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const Authenticated = async (req, res, next) => {
  const token = req.header("Auth");
  if (!token) return res.json({ message: "Login First" });
  //const decoded = jwt.verify(token, "!@#$%^&*()");
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  // console.log(decoded);

  const id = decoded.userId;
  let user = await User.findById(id);
  if (!user) return res.json({ message: "User not found" });
  //req.user = user; // cahnge for check
  //req.user = user._id;
  //req.user = user._id; // ✅ for DB queries (cart)
  //req.userData = user;
  req.user = user._id;
  next();
};
