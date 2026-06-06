import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: [100, "Product name cannot exceed 100 characters"],
  },
  slug: {
    type: String,
    unique: true,
  },
  description: {
    type: String,
    required: true,
    maxlength: [500, "Description cannot exceed 500 characters"],
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  // Legacy single image field (kept for backward compatibility)
  imageSrc: {
    type: String,
    default: "",
  },
  // Multiple images stored as Base64 data URIs
  images: {
    type: [String],
    default: [],
  },
  qty: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Auto-generate slug from title before saving
productSchema.pre("save", async function () {
  if (!this.isModified("title") && this.slug) return;

  let base = this.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  let slug = base;
  let counter = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const exists = await mongoose.model("Products").findOne({ slug, _id: { $ne: this._id } });
    if (!exists) break;
    slug = `${base}-${counter++}`;
  }
  this.slug = slug;
});

// Index for sorting by createdAt (prevents memory limit errors with large documents)
productSchema.index({ createdAt: -1 });
productSchema.index({ category: 1, createdAt: -1 });
productSchema.index({ qty: 1 });

const Products = mongoose.model("Products", productSchema);

export default Products;
