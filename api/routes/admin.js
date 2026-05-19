import express from "express";
import { isAdmin } from "../middlewares/admin.js";
import {
  getDashboardStats,
  addProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getProduct,
  updateStock,
  getAllOrders,
  updateOrderStatus,
  getAllUsers,
  toggleAdminRole,
  makeAdminByEmail,
  upload,
} from "../controllers/admin.js";

const router = express.Router();

// All routes require admin authentication
router.use(isAdmin);

// Dashboard
router.get("/dashboard", getDashboardStats);

// Product CRUD (with image upload)
router.get("/products", getAllProducts);
router.get("/products/:id", getProduct);
router.post("/products", upload.array("images", 10), addProduct);
router.put("/products/:id", upload.array("images", 10), updateProduct);
router.delete("/products/:id", deleteProduct);

// Inventory / Stock
router.patch("/products/:id/stock", updateStock);

// Orders management
router.get("/orders", getAllOrders);
router.put("/orders/:id/status", updateOrderStatus);

// User management
router.get("/users", getAllUsers);
router.post("/users/make-admin", makeAdminByEmail);
router.patch("/users/:id/toggle-admin", toggleAdminRole);

export default router;
