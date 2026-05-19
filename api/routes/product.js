import express from "express";
import {
  addProduct,
  deleteProductById,
  getProductById,
  getProducts,
  updateProductById,
  upload,
} from "../controllers/product.js";

const router = express.Router();

// ✅ attach multer here — supports up to 10 images
router.post("/add", upload.array("images", 10), addProduct);

//get products
router.get("/all", getProducts);

//get product by id
router.get("/:id", getProductById);

//update product by id
router.put("/:id", upload.array("images", 10), updateProductById);

//delete product by id
router.delete("/:id", deleteProductById);

export default router;
