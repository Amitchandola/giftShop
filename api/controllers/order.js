import Cart from "../models/Cart.js";
import Products from "../models/Product.js";
import Order from "../models/Order.js";
import Address from "../models/Address.js";
import sendOrderMails from "../utils/sendMail.js";
import User from "../models/User.js";
export const placeOrder = async (req, res) => {
  try {
    const userId = req.user;
    const { transactionId, addressId, paymentMethod } = req.body;
    const isCOD = paymentMethod === "COD";

    if (!isCOD && !transactionId) {
      return res.json({
        success: false,
        message: "Transaction ID required for UPI payment",
      });
    }

    if (!isCOD && !req.file) {
      return res.json({
        success: false,
        message: "Payment screenshot required for UPI payment",
      });
    }
    const user = await User.findById(userId);

    // ✅ Get user cart
    const cart = await Cart.findOne({ userId });

    if (!cart || cart.items.length === 0) {
      return res.json({
        success: false,
        message: "Cart is empty",
      });
    }

    // ✅ Get user address (selected or first)
    const userAddress = addressId
      ? await Address.findOne({ _id: addressId, userId })
      : await Address.findOne({ userId });

    if (!userAddress) {
      return res.json({
        success: false,
        message: "Please add address first",
      });
    }

    let cartTotal = 0;

    // ✅ Check stock before placing order
    for (const item of cart.items) {
      const product = await Products.findById(item.productId);

      if (!product) {
        return res.json({
          success: false,
          message: `${item.title} not found`,
        });
      }

      if (product.qty < item.qty) {
        return res.json({
          success: false,
          message: `${product.title} only ${product.qty} left in stock`,
        });
      }

      cartTotal += item.price * item.qty;
    }

    // ✅ Delivery charges: ₹49 if cart >= 799, else ₹99
    const deliveryCharge = cartTotal >= 799 ? 49 : 99;
    const totalAmount = cartTotal + deliveryCharge;

    // ✅ Save order
    const newOrder = await Order.create({
      userId,
      items: cart.items,
      totalAmount,
      shippingAddress: userAddress,
      paymentMethod: isCOD ? "COD" : "UPI QR",
      transactionId: isCOD ? "" : (transactionId || ""),
      paymentScreenshot: isCOD ? "" : (req.file?.filename || ""),
      paymentStatus: isCOD ? "Pending" : (transactionId ? "Paid" : "Pending Verification"),
      orderStatus: "Placed",
      statusHistory: [{ status: "Placed", timestamp: new Date() }],
    });

    // ✅ Reduce stock
    for (const item of cart.items) {
      await Products.findByIdAndUpdate(
        item.productId,
        {
          $inc: { qty: -item.qty },
        },
        { returnDocument: "after" },
      );
    }

    if (!isCOD && transactionId) {
      await sendOrderMails({
        userName: user.name,
        customerEmail: user.email,
        phoneNumber: userAddress.phoneNumber,
        cartTotal,
        deliveryCharge,
        totalPrice: totalAmount,
        address: `${userAddress.address}, ${userAddress.city}, ${userAddress.state}, ${userAddress.country} - ${userAddress.pinCode}`,
        items: cart.items,
        transactionId: transactionId,
        paymentScreenshot: req.file?.filename || "",
      });
    }

    if (isCOD) {
      await sendOrderMails({
        userName: user.name,
        customerEmail: user.email,
        phoneNumber: userAddress.phoneNumber,
        cartTotal,
        deliveryCharge,
        totalPrice: totalAmount,
        address: `${userAddress.address}, ${userAddress.city}, ${userAddress.state}, ${userAddress.country} - ${userAddress.pinCode}`,
        items: cart.items,
        transactionId: "COD",
        paymentScreenshot: "",
      });
    }

    // ✅ Clear cart
    cart.items = [];
    await cart.save();

    res.json({
      success: true,
      message: "Order placed successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error("Order error:", error.name || "Unknown");

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
//cancel order, refund, update stock, send mails can be implemented later
export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.json({
        success: false,
        message: "Order not found",
      });
    }

    // Prevent double cancel
    if (order.orderStatus === "Cancelled") {
      return res.json({
        success: false,
        message: "Order already cancelled",
      });
    }

    // Only allow cancel when order is still in Placed status
    if (order.orderStatus !== "Placed") {
      return res.json({
        success: false,
        message: "Order can only be cancelled when in Placed status",
      });
    }

    // Restore stock
    for (const item of order.items) {
      await Products.findByIdAndUpdate(item.productId, {
        $inc: { qty: item.qty },
      });
    }

    order.orderStatus = "Cancelled";
    order.statusHistory.push({ status: "Cancelled", timestamp: new Date() });
    await order.save();

    res.json({
      success: true,
      message: "Order cancelled successfully",
    });
  } catch (error) {
    console.error("Order error:", error.name || "Unknown");

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
//My order
export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user;

    const orders = await Order.find({ userId }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Order error:", error.name || "Unknown");

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};