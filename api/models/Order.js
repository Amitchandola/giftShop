// import mongoose from "mongoose";

// const orderSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true,
//   },

//   items: [
//     {
//       productId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Products",
//       },
//       title: String,
//       price: Number,
//       qty: Number,
//       imageSrc: String,
//     },
//   ],

//   totalAmount: {
//     type: Number,
//     required: true,
//   },

//   shippingAddress: {
//     type: Object,
//     default: {},
//   },

//   paymentMethod: {
//     type: String,
//     default: "UPI",
//   },

//   paymentStatus: {
//     type: String,
//     default: "Paid",
//   },

//   orderStatus: {
//     type: String,
//     default: "Placed",
//   },

//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// const Order = mongoose.model("Order", orderSchema);

// export default Order;
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Products",
      },
      title: String,
      price: Number,
      qty: Number,
      imageSrc: String,
    },
  ],

  totalAmount: {
    type: Number,
    required: true,
  },

  shippingAddress: {
    type: Object,
    default: {},
  },

  paymentMethod: {
    type: String,
    enum: ["UPI QR", "COD"],
    default: "UPI QR",
  },

  transactionId: {
    type: String,
    default: "",
  },
  paymentScreenshot: {
    type: String,
    default: "",
  },

  // paymentStatus: {
  //   type: String,
  //   enum: ["Pending", "Paid", "Failed"],
  //   default: "Pending",
  // },
  paymentStatus: {
    type: String,
    enum: ["Pending Verification", "Pending", "Paid", "Failed"],
    default: "Pending Verification",
  },

  orderStatus: {
    type: String,
    enum: ["Placed", "Packed", "Shipped", "Delivered", "Cancelled"],
    default: "Placed",
  },

  trackingId: {
    type: String,
    default: "",
  },

  statusHistory: [
    {
      status: {
        type: String,
        enum: ["Placed", "Packed", "Shipped", "Delivered", "Cancelled"],
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
      trackingId: {
        type: String,
        default: "",
      },
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ createdAt: -1 });

const Order = mongoose.model("Order", orderSchema);

export default Order;
