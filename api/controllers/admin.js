import Products from "../models/Product.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import multer from "multer";
import sharp from "sharp";

// Memory storage for product images (stored as Base64 in DB)
const memoryStorage = multer.memoryStorage();
export const upload = multer({
  storage: memoryStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max per file
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

/**
 * Compress image for gallery (detail page) — 1200px, 85% WebP
 */
async function compressImage(buffer) {
  const compressed = await sharp(buffer)
    .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer();
  return `data:image/webp;base64,${compressed.toString("base64")}`;
}

/**
 * Generate lightweight thumbnail for listing — 500px, 80% WebP
 */
async function generateThumbnail(buffer) {
  const compressed = await sharp(buffer)
    .resize(500, 500, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();
  return `data:image/webp;base64,${compressed.toString("base64")}`;
}

// --- Dashboard Stats ---
export const getDashboardStats = async (req, res) => {
  try {
    const [totalProducts, totalOrders, totalUsers, lowStockProducts] =
      await Promise.all([
        Products.countDocuments(),
        Order.countDocuments(),
        User.countDocuments(),
        Products.find({ qty: { $lte: 5 } })
          .select("title qty category")
          .sort({ qty: 1 }),
      ]);

    res.json({
      success: true,
      stats: { totalProducts, totalOrders, totalUsers },
      lowStockProducts,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// --- Add Product (with images) ---
export const addProduct = async (req, res) => {
  try {
    const { title, description, price, category, qty } = req.body;

    if (title && title.length > 100) {
      return res.status(400).json({ success: false, message: "Product name cannot exceed 100 characters" });
    }
    if (description && description.length > 500) {
      return res.status(400).json({ success: false, message: "Description cannot exceed 500 characters" });
    }

    const images = [];
    let imageSrc = "";

    if (req.files && req.files.length > 0) {
      // Generate thumbnail from first image (for fast listing)
      imageSrc = await generateThumbnail(req.files[0].buffer);

      // Compress all images at higher quality (for detail page)
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

    res.status(201).json({
      success: true,
      message: "Product added successfully",
      product,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: "Invalid request" });
  }
};

// --- Update Product (with optional new images) ---
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.title && updateData.title.length > 100) {
      return res.status(400).json({ success: false, message: "Product name cannot exceed 100 characters" });
    }
    if (updateData.description && updateData.description.length > 500) {
      return res.status(400).json({ success: false, message: "Description cannot exceed 500 characters" });
    }

    // Handle image management: keepImages + new uploads
    let finalImages = [];

    // Parse kept existing images (already compressed from before)
    if (updateData.keepImages) {
      try {
        finalImages = JSON.parse(updateData.keepImages);
      } catch (e) {
        finalImages = [];
      }
      delete updateData.keepImages;
    }

    // Add newly uploaded images (compress them)
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const compressed = await compressImage(file.buffer);
        finalImages.push(compressed);
      }
    }

    // Only update images if keepImages was sent (meaning inline edit was used)
    if (req.body.keepImages !== undefined || (req.files && req.files.length > 0)) {
      updateData.images = finalImages;
      // Regenerate thumbnail from first image
      if (finalImages.length > 0) {
        // If we have new uploads, use first new file for thumbnail
        if (req.files && req.files.length > 0 && !req.body.keepImages) {
          updateData.imageSrc = await generateThumbnail(req.files[0].buffer);
        } else {
          // Use first kept/new image as thumbnail (already compressed, just use as-is)
          updateData.imageSrc = finalImages[0];
        }
      } else {
        updateData.imageSrc = "";
      }
    }

    const product = await Products.findByIdAndUpdate(id, updateData, {
      returnDocument: "after",
      runValidators: true,
    });

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// --- Delete Product ---
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Products.findByIdAndDelete(id);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// --- Get All Products (with search, filter, pagination) ---
export const getAllProducts = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }
    if (category) {
      filter.category = { $regex: category, $options: "i" };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [products, total] = await Promise.all([
      Products.find(filter)
        .select("-images")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Products.countDocuments(filter),
    ]);

    res.json({
      success: true,
      products,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// --- Get Single Product ---
export const getProduct = async (req, res) => {
  try {
    const product = await Products.findById(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// --- Update Stock/Inventory ---
export const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { qty } = req.body;

    if (qty === undefined || qty < 0) {
      return res
        .status(400)
        .json({ success: false, message: "Valid quantity is required" });
    }

    const product = await Products.findByIdAndUpdate(
      id,
      { qty },
      { returnDocument: "after", runValidators: true }
    );

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.json({
      success: true,
      message: "Stock updated successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// --- Get All Orders (admin view) ---
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("userId", "name email")
      .lean();

    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// --- Update Order Status ---
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, trackingId } = req.body;

    const validStatuses = ["Placed", "Packed", "Shipped", "Delivered", "Cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // If marking as Shipped, tracking ID is required
    if (status === "Shipped" && !trackingId) {
      return res.status(400).json({ success: false, message: "Tracking ID is required for Shipped status" });
    }

    // If cancelled, restore stock
    if (status === "Cancelled") {
      for (const item of order.items) {
        await Products.findByIdAndUpdate(item.productId, {
          $inc: { qty: item.qty },
        });
      }
    }

    // Use atomic $set and $push to avoid Mongoose change-tracking issues
    const updateOps = {
      $set: { orderStatus: status },
      $push: {
        statusHistory: {
          status,
          timestamp: new Date(),
          trackingId: status === "Shipped" ? (trackingId || "") : "",
        },
      },
    };

    // Store tracking ID when shipped
    if (status === "Shipped" && trackingId) {
      updateOps.$set.trackingId = trackingId;
    }

    const updatedOrder = await Order.findByIdAndUpdate(id, updateOps, { returnDocument: "after" })
      .populate("userId", "name email");

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      order: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// --- Get All Users ---
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// --- Toggle Admin Role ---
export const toggleAdminRole = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent self-demotion
    if (id === req.user.toString()) {
      return res
        .status(400)
        .json({ success: false, message: "You cannot change your own admin status" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    user.isAdmin = !user.isAdmin;
    await user.save();

    res.json({
      success: true,
      message: user.isAdmin
        ? `${user.name} is now an admin`
        : `${user.name} is no longer an admin`,
      user: { _id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// --- Make Admin by Email ---
export const makeAdminByEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const targetUser = await User.findOne({ email: email.trim().toLowerCase() });
    if (!targetUser) {
      return res.status(404).json({ success: false, message: "No registered user found with this email" });
    }

    if (targetUser.isAdmin) {
      return res.status(400).json({ success: false, message: `${targetUser.name} is already an admin` });
    }

    targetUser.isAdmin = true;
    await targetUser.save();

    res.json({
      success: true,
      message: `${targetUser.name} (${targetUser.email}) is now an admin`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};
