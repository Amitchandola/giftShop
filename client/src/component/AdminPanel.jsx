import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import AppContext from "../context/AppContext";
import { Trash2, Edit3, Package, Plus, X, ChevronDown, ChevronUp, Save, ImageMinus, Users, ShieldCheck, ShieldOff } from "lucide-react";

function AdminPanel() {
  const { url, token, user, refreshProducts } = useContext(AppContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [search, setSearch] = useState("");
  const [expandedProduct, setExpandedProduct] = useState(null);
  const [inlineEdit, setInlineEdit] = useState({});
  const [inlineImages, setInlineImages] = useState([]);
  const [activeTab, setActiveTab] = useState("products");
  const [allUsers, setAllUsers] = useState([]);
  const [adminEmail, setAdminEmail] = useState("");

  // Add/Edit form state
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    qty: "",
  });
  const [images, setImages] = useState([]);

  const authHeader = { Auth: token || localStorage.getItem("token") };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${url}/admin/products?search=${search}`, {
        headers: authHeader,
        withCredentials: true,
      });
      const items = res.data.products || [];
      // Sort: low stock (qty < 10) first, then by qty ascending within that group
      items.sort((a, b) => {
        const aLow = a.qty < 10 ? 0 : 1;
        const bLow = b.qty < 10 ? 0 : 1;
        if (aLow !== bLow) return aLow - bLow;
        return a.qty - b.qty;
      });
      setProducts(items);
    } catch (err) {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search]);

  const resetForm = () => {
    setForm({ title: "", description: "", price: "", category: "", qty: "" });
    setImages([]);
    setEditingProduct(null);
    setShowAddForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("price", form.price);
    formData.append("category", form.category);
    formData.append("qty", form.qty);
    for (const img of images) {
      formData.append("images", img);
    }

    try {
      setLoading(true);
      if (editingProduct) {
        await axios.put(`${url}/admin/products/${editingProduct._id}`, formData, {
          headers: { ...authHeader, "Content-Type": "multipart/form-data" },
          withCredentials: true,
        });
        toast.success("Product updated");
      } else {
        await axios.post(`${url}/admin/products`, formData, {
          headers: { ...authHeader, "Content-Type": "multipart/form-data" },
          withCredentials: true,
        });
        toast.success("Product added");
      }
      resetForm();
      fetchProducts();
      refreshProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setForm({
      title: product.title,
      description: product.description,
      price: product.price,
      category: product.category,
      qty: product.qty,
    });
    setImages([]);
    setEditingProduct(product);
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(`${url}/admin/products/${id}`, {
        headers: authHeader,
        withCredentials: true,
      });
      toast.success("Product deleted");
      fetchProducts();
      refreshProducts();
    } catch (err) {
      toast.error("Failed to delete product");
    }
  };

  const handleStockUpdate = async (id, qty) => {
    try {
      await axios.patch(
        `${url}/admin/products/${id}/stock`,
        { qty: parseInt(qty) },
        { headers: authHeader, withCredentials: true }
      );
      toast.success("Stock updated");
      fetchProducts();
      refreshProducts();
    } catch (err) {
      toast.error("Failed to update stock");
    }
  };

  const startInlineEdit = (product) => {
    setExpandedProduct(product._id);
    setInlineEdit({
      price: product.price,
      description: product.description,
      qty: product.qty,
      existingImages: product.images || [],
      removedImages: [],
    });
    setInlineImages([]);
  };

  const handleRemoveImage = (index) => {
    setInlineEdit((prev) => {
      const img = prev.existingImages[index];
      return {
        ...prev,
        existingImages: prev.existingImages.filter((_, i) => i !== index),
        removedImages: [...prev.removedImages, img],
      };
    });
  };

  const handleInlineSave = async (id) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("price", inlineEdit.price);
      formData.append("description", inlineEdit.description);
      formData.append("qty", inlineEdit.qty);

      // Send remaining existing images as JSON so backend knows which to keep
      const keepImages = inlineEdit.existingImages || [];
      formData.append("keepImages", JSON.stringify(keepImages));

      // Append new image files
      for (const img of inlineImages) {
        formData.append("images", img);
      }

      await axios.put(`${url}/admin/products/${id}`, formData, {
        headers: { ...authHeader, "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      toast.success("Product updated");
      setExpandedProduct(null);
      setInlineEdit({});
      setInlineImages([]);
      fetchProducts();
      refreshProducts();
    } catch (err) {
      toast.error("Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 text-xl font-semibold">Access Denied. Admin only.</p>
      </div>
    );
  }

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${url}/admin/users`, {
        headers: authHeader,
        withCredentials: true,
      });
      // Only keep admins
      setAllUsers((res.data.users || []).filter((u) => u.isAdmin));
    } catch (err) {
      toast.error("Failed to load admins");
    }
  };

  const handleMakeAdmin = async (e) => {
    e.preventDefault();
    if (!adminEmail.trim()) return;
    try {
      const res = await axios.post(
        `${url}/admin/users/make-admin`,
        { email: adminEmail.trim().toLowerCase() },
        { headers: { ...authHeader, "Content-Type": "application/json" }, withCredentials: true }
      );
      toast.success(res.data.message);
      setAdminEmail("");
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to make admin");
    }
  };

  const handleRemoveAdmin = async (userId, userName) => {
    if (!window.confirm(`Remove admin access from ${userName}?`)) return;
    try {
      const res = await axios.patch(
        `${url}/admin/users/${userId}/toggle-admin`,
        {},
        { headers: authHeader, withCredentials: true }
      );
      toast.success(res.data.message);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold text-amber-400 flex items-center gap-2">
            <Package size={30} /> Admin Panel
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-700">
          <button
            onClick={() => setActiveTab("products")}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition ${
              activeTab === "products"
                ? "bg-amber-500 text-black"
                : "text-gray-400 hover:bg-gray-800"
            }`}
          >
            <Package size={16} className="inline mr-1.5 -mt-0.5" />
            Products
          </button>
          <button
            onClick={() => {
              setActiveTab("users");
              if (allUsers.length === 0) fetchUsers();
            }}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition ${
              activeTab === "users"
                ? "bg-amber-500 text-black"
                : "text-gray-400 hover:bg-gray-800"
            }`}
          >
            <Users size={16} className="inline mr-1.5 -mt-0.5" />
            User Management
          </button>
        </div>

        {/* Products Tab */}
        {activeTab === "products" && (<>
        <div className="flex justify-end mb-4">
          <button
            onClick={() => {
              if (showAddForm) resetForm();
              else setShowAddForm(true);
            }}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black px-5 py-2.5 rounded-lg transition font-semibold"
          >
            {showAddForm ? <X size={18} /> : <Plus size={18} />}
            {showAddForm ? "Cancel" : "Add Product"}
          </button>
        </div>

        {/* Add/Edit Product Form */}
        {showAddForm && (
          <div className="bg-gray-800 rounded-xl shadow-md p-6 mb-8 border border-amber-500/20">
            <h2 className="text-xl font-semibold text-white mb-4">
              {editingProduct ? "Edit Product" : "Add New Product"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-amber-400/50 outline-none"
                    placeholder="Product title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-amber-400/50 outline-none"
                    placeholder="e.g. toys, gifts, books"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-amber-400/50 outline-none"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Quantity</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={form.qty}
                    onChange={(e) => setForm({ ...form, qty: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-amber-400/50 outline-none"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-amber-400/50 outline-none resize-none"
                  placeholder="Product description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Images {editingProduct && "(upload new to replace)"}
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setImages(Array.from(e.target.files))}
                  className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg"
                />
                {images.length > 0 && (
                  <p className="text-sm text-gray-500 mt-1">{images.length} file(s) selected</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-amber-500 hover:bg-amber-600 text-black px-6 py-2.5 rounded-lg transition disabled:opacity-50 font-semibold"
              >
                {loading ? "Saving..." : editingProduct ? "Update Product" : "Add Product"}
              </button>
            </form>
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by name..."
            className="w-full max-w-md px-4 py-2 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-amber-400/50 outline-none placeholder-gray-400"
          />
        </div>

        {/* Product List */}
        {loading && products.length === 0 ? (
          <p className="text-gray-500 text-center py-10">Loading...</p>
        ) : products.length === 0 ? (
          <p className="text-gray-500 text-center py-10">No products found.</p>
        ) : (
          <div className="space-y-3">
            {products.map((p) => (
              <div
                key={p._id}
                className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 overflow-hidden"
              >
                {/* Main row */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4">
                  {/* Thumbnail + Info */}
                  <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    <img
                      src={p.imageSrc || p.images?.[0] || ""}
                      alt={p.title}
                      className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-lg bg-gray-100 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate">{p.title}</h3>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-gray-400 mt-1">
                        <span>₹{p.price}</span>
                        <span className="hidden sm:inline text-gray-600">|</span>
                        <span>{p.category}</span>
                        <span className="hidden sm:inline text-gray-600">|</span>
                        <span className={p.qty <= 5 ? "text-red-500 font-medium" : ""}>
                          Stock: {p.qty}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stock quick update */}
                  <div className="hidden sm:flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      defaultValue={p.qty}
                      className="w-20 px-2 py-1 border border-gray-600 bg-gray-700 text-white rounded text-center text-sm"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleStockUpdate(p._id, e.target.value);
                      }}
                      onBlur={(e) => {
                        if (parseInt(e.target.value) !== p.qty) {
                          handleStockUpdate(p._id, e.target.value);
                        }
                      }}
                    />
                    <span className="text-xs text-gray-400">qty</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 sm:gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => {
                        if (expandedProduct === p._id) {
                          setExpandedProduct(null);
                          setInlineEdit({});
                        } else {
                          startInlineEdit(p);
                        }
                      }}
                      className="p-2 text-amber-400 hover:bg-amber-500/10 rounded-lg transition"
                      title="Quick Edit"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(p._id)}
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                    <button
                      onClick={() => {
                        if (expandedProduct === p._id) {
                          setExpandedProduct(null);
                          setInlineEdit({});
                        } else {
                          startInlineEdit(p);
                        }
                      }}
                      className="p-2 text-gray-400 hover:bg-gray-700 rounded-lg transition"
                    >
                      {expandedProduct === p._id ? (
                        <ChevronUp size={18} />
                      ) : (
                        <ChevronDown size={18} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded inline edit */}
                {expandedProduct === p._id && inlineEdit.price !== undefined && (
                  <div className="px-4 pb-4 border-t border-gray-700 pt-4 space-y-4">
                    {/* Price, Qty row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">Price (₹)</label>
                        <input
                          type="number"
                          min="0"
                          value={inlineEdit.price}
                          onChange={(e) => setInlineEdit({ ...inlineEdit, price: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-amber-400/50 outline-none text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">Quantity</label>
                        <input
                          type="number"
                          min="0"
                          value={inlineEdit.qty}
                          onChange={(e) => setInlineEdit({ ...inlineEdit, qty: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-amber-400/50 outline-none text-sm"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Description</label>
                      <textarea
                        rows={3}
                        value={inlineEdit.description}
                        onChange={(e) => setInlineEdit({ ...inlineEdit, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-amber-400/50 outline-none text-sm resize-none"
                      />
                    </div>

                    {/* Existing Images with remove */}
                    {inlineEdit.existingImages && inlineEdit.existingImages.length > 0 && (
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-2">Current Images (click X to remove)</label>
                        <div className="flex gap-3 flex-wrap">
                          {inlineEdit.existingImages.map((img, i) => (
                            <div key={i} className="relative group">
                              <img
                                src={img}
                                alt={`Image ${i + 1}`}
                                className="w-24 h-24 object-cover rounded-lg border"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(i)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600 transition"
                                title="Remove image"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Add new images */}
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Add New Images</label>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => setInlineImages(Array.from(e.target.files))}
                        className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg text-sm"
                      />
                      {inlineImages.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">{inlineImages.length} new file(s) selected</p>
                      )}
                    </div>

                    {/* Save button */}
                    <button
                      onClick={() => handleInlineSave(p._id)}
                      disabled={loading}
                      className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black px-5 py-2 rounded-lg transition disabled:opacity-50 text-sm font-semibold"
                    >
                      <Save size={16} />
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        </>)}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div>
            {/* Add Admin Form */}
            <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6 mb-6">
              <h2 className="text-lg font-semibold text-white mb-3">Add New Admin</h2>
              <form onSubmit={handleMakeAdmin} className="flex gap-3 flex-col sm:flex-row">
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="Enter registered user's email..."
                  className="flex-1 px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-amber-400/50 outline-none placeholder-gray-400"
                />
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black px-5 py-2 rounded-lg transition text-sm font-semibold"
                >
                  <ShieldCheck size={16} /> Make Admin
                </button>
              </form>
              <p className="text-xs text-gray-400 mt-2">The user must already be registered on the website.</p>
            </div>

            {/* Admin List */}
            <h2 className="text-lg font-semibold text-white mb-3">Current Admins</h2>
            {allUsers.length === 0 ? (
              <p className="text-gray-500 text-center py-10">No admins found.</p>
            ) : (
              <div className="space-y-2">
                {allUsers.map((u) => (
                  <div
                    key={u._id}
                    className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-4 flex items-center justify-between gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate">{u.name}</h3>
                      <p className="text-sm text-gray-400 truncate">{u.email}</p>
                    </div>

                    {u._id !== user._id ? (
                      <button
                        onClick={() => handleRemoveAdmin(u._id, u.name)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30"
                      >
                        <ShieldOff size={16} /> Remove Admin
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400 italic">You</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;
