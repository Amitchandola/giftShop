import Products from "../models/Product.js";
import multer from "multer";
import sharp from "sharp";

// Memory storage for product images (stored as Base64 in DB)
const memoryStorage = multer.memoryStorage();
export const upload = multer({
  storage: memoryStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

/**
 * Compress an image for the product gallery (detail page):
 * - Resize to max 1200px width (maintains aspect ratio)
 * - Convert to WebP at 85% quality
 * - Good balance of quality and size (~50-150KB per image)
 */
async function compressImage(buffer) {
  const compressed = await sharp(buffer)
    .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer();
  return `data:image/webp;base64,${compressed.toString("base64")}`;
}

/**
 * Generate a lightweight thumbnail for product listing cards:
 * - Resize to max 500px width
 * - Convert to WebP at 80% quality
 * - Result: ~20-50KB per thumbnail (fast listing load)
 */
async function generateThumbnail(buffer) {
  const compressed = await sharp(buffer)
    .resize(500, 500, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();
  return `data:image/webp;base64,${compressed.toString("base64")}`;
}

// Disk storage for payment screenshots (used by order routes)
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
export const uploadDisk = multer({ storage: diskStorage });

//add Products

export const addProduct = async (req, res) => {
  const { title, description, price, category, qty } = req.body;

  try {
    const images = [];
    let imageSrc = "";

    if (req.files && req.files.length > 0) {
      // Generate thumbnail from first image (for listing cards)
      imageSrc = await generateThumbnail(req.files[0].buffer);

      // Compress all images at higher quality (for detail page gallery)
      for (const file of req.files) {
        const compressed = await compressImage(file.buffer);
        images.push(compressed);
      }
    }

    const product = await Products.create({
      title,
      description,
      price,
      category,
      imageSrc,
      images,
      qty,
    });

    res.json({ message: "Product added", success: true, product });
  } catch (error) {
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

//get products

export const getProducts = async (req, res) => {
  try {
    // Exclude heavy 'images' array from listing — frontend only needs imageSrc (thumbnail)
    const products = await Products.find()
      .select("-images")
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      message: "Products retrieved successfully",
      success: true,
      products,
    });
  } catch (error) {
    console.error("getProducts error:", error);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

//find product by id

export const getProductById = async (req, res) => {
  const id = req.params.id;
  // Support lookup by slug (non-hex string) or by ObjectId
  let products;
  if (/^[0-9a-fA-F]{24}$/.test(id)) {
    products = await Products.findById(id);
  } else {
    products = await Products.findOne({ slug: id });
  }
  if (!products) return res.json({ message: "invalid id" });
  res.json({
    message: "Product retrieved successfully",
    success: true,
    products,
  });
};

//update product by id

// export const updateProductById = async (req, res) => {
//   const id = req.params.id;
//   let products = await Products.findByIdAndUpdate(id, req.body, { new: true });
//   if (!products) return res.json({ message: "invalid id" });
//   res.json({
//     message: "Product updated successfully",
//     success: true,
//     products,
//   });
// };
export const updateProductById = async (req, res) => {
  try {
    const id = req.params.id;
    const updateData = { ...req.body };

    if (req.files && req.files.length > 0) {
      const images = [];
      for (const file of req.files) {
        const compressed = await compressImage(file.buffer);
        images.push(compressed);
      }
      updateData.images = images;
      updateData.imageSrc = images[0];
    }

    const product = await Products.findByIdAndUpdate(id, updateData, {
      returnDocument: "after",
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Invalid product id",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Product update error:", error.name || "Unknown");

    res.status(500).json({
      success: false,
      message: "Server Error",
      error: "Server error",
    });
  }
};
//delete product by id

export const deleteProductById = async (req, res) => {
  const id = req.params.id;
  let products = await Products.findByIdAndDelete(id);
  if (!products) return res.json({ message: "invalid Id" });
  res.json({ message: "Product deleted successfully", success: true });
};
