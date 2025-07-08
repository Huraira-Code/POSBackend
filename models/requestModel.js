const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  packageId: { type: mongoose.Schema.Types.ObjectId, ref: "Package", required: true },
  packageName: String,
  amount: Number,
  paymentTime: Date,
  stripeSessionId: String,

  // Distinguish new vs renewal
  isRenewal: { type: Boolean, default: false },

  // For renewals, store adminId
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" }
});

module.exports = mongoose.model("Request", requestSchema);
