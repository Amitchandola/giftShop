import Wishlist from "../models/Wishlist.js";
import mongoose from "mongoose";

// Toggle wishlist (add if not present, remove if present)
export const toggleWishlist = async (req, res) => {
  try {
    const userId = req.user;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: "Product ID required" });
    }

    const prodObjId = new mongoose.Types.ObjectId(productId);

    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      wishlist = await Wishlist.create({ userId, products: [prodObjId] });
      return res.json({ success: true, message: "Added to wishlist", wishlisted: true });
    }

    const idx = wishlist.products.findIndex((id) => id.equals(prodObjId));

    if (idx > -1) {
      wishlist.products.splice(idx, 1);
      await wishlist.save();
      return res.json({ success: true, message: "Removed from wishlist", wishlisted: false });
    } else {
      wishlist.products.push(prodObjId);
      await wishlist.save();
      return res.json({ success: true, message: "Added to wishlist", wishlisted: true });
    }
  } catch (error) {
    console.error("Wishlist toggle error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user wishlist
export const getWishlist = async (req, res) => {
  try {
    const userId = req.user;
    const wishlist = await Wishlist.findOne({ userId }).populate("products");

    if (!wishlist) {
      return res.json({ success: true, products: [] });
    }

    res.json({ success: true, products: wishlist.products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
