import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    unique: true,
  },
  description: {
    type: String,
    required: true,
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

const Products = mongoose.model("Products", productSchema);

export default Products;
