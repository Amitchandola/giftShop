import express from "express";
import {
  addToCart,
  clearCart,
  decreaseCartItemQty,
  getUserCart,
  removeFromCart,
} from "../controllers/cart.js";

import { Authenticated } from "../middlewares/auth.js";

const router = express.Router();

//add to cart

router.post("/add", Authenticated, addToCart);

//get user cart
router.get("/user", Authenticated, getUserCart);

//remove from cart
router.delete("/remove/:productId", Authenticated, removeFromCart);

//clear cart
router.delete("/clear", Authenticated, clearCart);

//decrease quantity of a product in cart
router.post("/decrease-qty", Authenticated, decreaseCartItemQty);

export default router;
