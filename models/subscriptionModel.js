const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true, unique: true },
  email: String,
  packageId: { type: mongoose.Schema.Types.ObjectId, ref: "Package" },
  packageName: String,
  amount: Number,
  startDate: Date,
  endDate: Date,
  stripeSessionId: String,
}, { timestamps: true });

module.exports = mongoose.model("Subscription", subscriptionSchema);
