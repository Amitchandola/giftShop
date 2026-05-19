// import Cart from "../models/Cart.js";

// //add to cart
// export const addToCart = async (req, res) => {
//   const { productId, title, description, price, imageSrc } = req.body;

//   const userId = req.user;

//   let cart = await Cart.findOne({ userId });

//   if (!cart) {
//     cart = new Cart({ userId, items: [] });
//   }

//   const itemIndex = cart.items.findIndex(
//     (item) => item.productId.toString() === productId.toString(),
//   );

//   if (itemIndex > -1) {
//     cart.items[itemIndex].qty += 1;
//   } else {
//     cart.items.push({
//       productId,
//       title,
//       //description,
//       description: description || "No description",
//       price, // single item price
//       qty: 1, // always start from 1
//       imageSrc,
//     });
//   }

//   await cart.save();

//   res.status(200).json({
//     success: true,
//     message: "Product added to cart successfully",
//     cart,
//   });
// };

//get user cart
// export const getUserCart = async (req, res) => {
//   const userId = req.user; // Assuming user ID is available in req.user after authentication
//   const cart = await Cart.findOne({ userId });
//   if (!cart) {
//     return res.status(404).json({ message: "Cart not found" });
//   }
//   res.status(200).json({ cart });
// };

import Cart from "../models/Cart.js";
import Products from "../models/Product.js";

export const addToCart = async (req, res) => {
  try {
    const { productId, title, description, price, imageSrc } = req.body;
    const userId = req.user;

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // ✅ Get product from DB
    const product = await Products.findById(productId);
    if (!product) {
      return res.json({ success: false, message: "Product not found" });
    }

    const stockQty = product.qty; // 👈 actual stock

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId.toString(),
    );

    if (itemIndex > -1) {
      // ❌ STOP if stock reached
      if (cart.items[itemIndex].qty >= stockQty) {
        return res.json({
          success: false,
          message: "Stock limit reached",
        });
      }

      cart.items[itemIndex].qty += 1;
    } else {
      cart.items.push({
        productId,
        title,
        description: description || "No description",
        price,
        qty: 1,
        imageSrc: imageSrc || product.images?.[0] || product.imageSrc || "",
      });
    }

    await cart.save();

    // Enrich cart items with stockQty
    const enrichedItems = [];
    for (const item of cart.items) {
      const prod = await Products.findById(item.productId).select("qty");
      enrichedItems.push({
        ...item.toObject(),
        stockQty: prod ? prod.qty : 0,
      });
    }

    res.status(200).json({
      success: true,
      message: "Product added to cart successfully",
      cart: { ...cart.toObject(), items: enrichedItems },
    });
  } catch (error) {
    console.error("addToCart error:", error.message);
    res.status(500).json({ success: false, message: "Failed to add to cart" });
  }
};

export const getUserCart = async (req, res) => {
  try {
    const userId = req.user;

    let cart = await Cart.findOne({ userId });

    // ✅ AUTO CREATE CART IF NOT EXISTS
    if (!cart) {
      cart = await Cart.create({
        userId,
        items: [],
      });
    }

    // Enrich cart items with current stockQty
    const enrichedItems = [];
    for (const item of cart.items) {
      const prod = await Products.findById(item.productId).select("qty");
      enrichedItems.push({
        ...item.toObject(),
        stockQty: prod ? prod.qty : 0,
      });
    }

    res.status(200).json({ cart: { ...cart.toObject(), items: enrichedItems } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
//remove from cart
export const removeFromCart = async (req, res) => {
  const productId = req.params.productId;
  const userId = req.user; // Assuming user ID is available in req.user after authentication

  let cart = await Cart.findOne({ userId });

  if (!cart) {
    return res.status(404).json({ message: "Cart not found" });
  }

  cart.items = cart.items.filter(
    (item) => item.productId.toString() !== productId.toString(),
  );

  await cart.save();

  res.status(200).json({
    message: "Product removed from cart successfully",
  });
};

//clear cart
export const clearCart = async (req, res) => {
  const userId = req.user; // Assuming user ID is available in req.user after authentication
  let cart = await Cart.findOne({ userId });

  if (!cart) {
    cart = new Cart({ items: [] });
  } else {
    cart.items = [];
  }
  await cart.save();

  res.status(200).json({ message: "Cart cleared successfully" });
};

//decrease quantity of a product in cart

export const decreaseCartItemQty = async (req, res) => {
  const { productId } = req.body; // only decrease by 1
  const userId = req.user; // Assuming user ID is available in req.user after authentication

  try {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.json({ items: [] });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId.toString(),
    );

    if (itemIndex > -1) {
      const item = cart.items[itemIndex];

      if (item.qty > 1) {
        const pricePerUnit = item.price / item.qty;

        item.qty -= 1;
        // item.price -= pricePerUnit;
      } else {
        // item.qty = 1;
        cart.items.splice(itemIndex, 1); // chnaged tis line
      }
    } else {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    await cart.save();

    res.status(200).json({
      message: "Product quantity decreased successfully",
      cart,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
