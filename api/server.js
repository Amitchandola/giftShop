import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file only if it exists (on hosting, env vars come from Application Manager)
const envPath = path.join(__dirname, ".env");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

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
app.set("trust proxy", true);
//app.use(bodyParser.json());
app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  }),
);

app.use(express.json({ limit: "50mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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

// ─── Serve React Frontend (production) ───
const clientDistPath = path.join(__dirname, "..", "client", "dist");
const publicPath = path.join(__dirname, "public");
const clientBuildPath = fs.existsSync(clientDistPath) ? clientDistPath : publicPath;
app.use(express.static(clientBuildPath));

// All non-API routes → React SPA
app.get("/{*splat}", (req, res) => {
  const indexPath = path.join(clientBuildPath, "index.html");
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send("index.html not found. Build the client first.");
  }
});

const port = process.env.PORT || 1000;

// Build MongoDB connection string
let mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DATABASE_URL;
if (!mongoUri) {
  console.error("ERROR: No MongoDB URI found. Set MONGO_URI in environment variables.");
  process.exit(1);
}
if (process.env.MONGO_PASSWORD_B64 && mongoUri.includes("<PASSWORD>")) {
  const mongoPassword = Buffer.from(process.env.MONGO_PASSWORD_B64, "base64").toString("utf-8");
  mongoUri = mongoUri.replace("<PASSWORD>", encodeURIComponent(mongoPassword));
}

mongoose
  .connect(mongoUri, {
    minPoolSize: 2,
    maxPoolSize: 50,
    maxIdleTimeMS: 30 * 60 * 1000,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error.name || "Connection failed");
    process.exit(1);
  });
