// import express from "express";
// import { placeOrder } from "../controllers/order.js";
// import { Authenticated } from "../middlewares/auth.js";

// const router = express.Router();

// // ✅ Place Order
// router.post("/place-order", Authenticated, placeOrder);

// export default router;
import express from "express";
import { placeOrder, cancelOrder, getMyOrders } from "../controllers/order.js";
import { Authenticated } from "../middlewares/auth.js";
import { uploadDisk } from "../controllers/product.js";

const router = express.Router();

// ✅ Place Order
router.post(
  "/place-order",
  Authenticated,
  uploadDisk.single("paymentScreenshot"),
  placeOrder,
);

// ✅ Cancel Order
router.put("/cancel-order/:orderId", Authenticated, cancelOrder);

//my orders
router.get("/my-orders", Authenticated, getMyOrders);

export default router;
