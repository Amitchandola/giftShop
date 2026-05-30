import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import userRoutes from "./routes/user.js";
//import bodyParser from "express";
import ProductRouter from "./routes/product.js";
import cartRoutes from "./routes/cart.js";
import addressRouter from "./routes/address.js";
import cors from "cors";
import orderRouter from "./routes/order.js";
import wishlistRouter from "./routes/wishlist.js";
import adminRouter from "./routes/admin.js";
import checkoutOtpRoutes from "./routes/checkoutOtpRoutes.js";

const app = express();
//app.use(bodyParser.json());
app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  }),
);

app.use(express.json({ limit: "50mb" }));
app.use("/uploads", express.static("uploads"));
app.get("/", (req, res) => {
  res.send("Welcome to the Gift Shop API !!!!!");
});

// Use the user routes
app.use("/api/users", userRoutes);

// Use the product routes
app.use("/api/products", ProductRouter);

//cart router

app.use("/api/cart", cartRoutes);

//address router
app.use("/api/address", addressRouter);
//order router
app.use("/api/order", orderRouter);

//wishlist router
app.use("/api/wishlist", wishlistRouter);

//admin router
app.use("/api/admin", adminRouter);

//checkout OTP router
app.use("/api/checkout-otp", checkoutOtpRoutes);

const port = process.env.PORT || 1000;

// Decode base64 password and inject into connection string
const mongoPassword = Buffer.from(process.env.MONGO_PASSWORD_B64, "base64").toString("utf-8");
const mongoUri = process.env.MONGO_URI.replace("<PASSWORD>", encodeURIComponent(mongoPassword));

mongoose
   .connect(mongoUri, {
     minPoolSize: 2,                  // Keep only 2 connections warm during low traffic
     maxPoolSize: 50,                 // Scale up to 50 per replica member under load (~150 total)
     maxIdleTimeMS: 30 * 60 * 1000,  // Close idle connections after 30 minutes
     serverSelectionTimeoutMS: 5000,
     socketTimeoutMS: 45000,
   })
 const port = process.env.PORT || 1000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });
