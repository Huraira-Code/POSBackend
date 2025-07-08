const mongoose = require("mongoose");

const pendingBillSchema = mongoose.Schema(
  {
    customerName: String,
    customerNumber: Number,
    paymentMode: String,
    cartItems: Array,
    subTotal: Number,
    tax: Number,
    totalAmount: Number,
    user: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PendingBill", pendingBillSchema); 