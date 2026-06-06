/**
 * One-time migration: Compress all existing product images in MongoDB.
 * 
 * Before: imageSrc = 1-4.5MB raw base64
 * After:  imageSrc = 30-80KB WebP base64 (800px max)
 * 
 * Run: node migrate-compress-images.js
 */
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import mongoose from "mongoose";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, ".env");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

async function compressImage(base64DataUri) {
  if (!base64DataUri || !base64DataUri.startsWith("data:")) return base64DataUri;

  // Extract raw base64 from data URI
  const matches = base64DataUri.match(/^data:image\/\w+;base64,(.+)$/);
  if (!matches) return base64DataUri;

  const buffer = Buffer.from(matches[1], "base64");

  // Skip if already small (likely already compressed)
  if (buffer.length < 100 * 1024) {
    console.log("    [skip] already small:", Math.round(buffer.length / 1024) + "KB");
    return base64DataUri;
  }

  const compressed = await sharp(buffer)
    .resize(800, 800, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 75 })
    .toBuffer();

  const result = `data:image/webp;base64,${compressed.toString("base64")}`;
  console.log(`    [compressed] ${Math.round(buffer.length / 1024)}KB → ${Math.round(compressed.length / 1024)}KB`);
  return result;
}

async function main() {
  let mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (process.env.MONGO_PASSWORD_B64 && mongoUri.includes("<PASSWORD>")) {
    const mongoPassword = Buffer.from(process.env.MONGO_PASSWORD_B64, "base64").toString("utf-8");
    mongoUri = mongoUri.replace("<PASSWORD>", encodeURIComponent(mongoPassword));
  }

  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB\n");

  const db = mongoose.connection.db;
  const products = await db.collection("products").find({}).toArray();
  console.log(`Found ${products.length} products to process\n`);

  for (const product of products) {
    console.log(`Processing: ${product.title}`);

    const updates = {};

    // Compress imageSrc
    if (product.imageSrc && product.imageSrc.startsWith("data:")) {
      const compressed = await compressImage(product.imageSrc);
      if (compressed !== product.imageSrc) {
        updates.imageSrc = compressed;
      }
    }

    // Compress images[] array
    if (product.images && product.images.length > 0) {
      const compressedImages = [];
      let changed = false;
      for (let i = 0; i < product.images.length; i++) {
        const img = product.images[i];
        const compressed = await compressImage(img);
        compressedImages.push(compressed);
        if (compressed !== img) changed = true;
      }
      if (changed) {
        updates.images = compressedImages;
      }
    }

    if (Object.keys(updates).length > 0) {
      await db.collection("products").updateOne(
        { _id: product._id },
        { $set: updates }
      );
      console.log(`  ✓ Updated\n`);
    } else {
      console.log(`  — No changes needed\n`);
    }
  }

  console.log("\nDone! All images compressed.");
  process.exit(0);
}

main().catch((e) => {
  console.error("Migration failed:", e.message);
  process.exit(1);
});
