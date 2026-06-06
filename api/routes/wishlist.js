import express from "express";
import { toggleWishlist, getWishlist } from "../controllers/wishlist.js";
import { Authenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/toggle", Authenticated, toggleWishlist);
router.get("/", Authenticated, getWishlist);

export default router;
