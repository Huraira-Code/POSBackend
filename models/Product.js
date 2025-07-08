const mongoose = require("mongoose");

const tierSchema = new mongoose.Schema({
  min: { type: Number, required: true },
  max: { type: Number },
  price: { type: Number, required: true }
});

const productSchema = new mongoose.Schema({
  name: String,
  price: Number, // Only used for fixed pricing
  quantity: Number,
  image: String,
  priceType: {
    type: String,
    enum: ["unit", "sqft", "lf"],
    default: "unit"
  },
  pricingMode: {
    type: String,
    enum: ["fixed", "tier"],
    default: "fixed"
  },
  tierPricing: [tierSchema],
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  assignedStock: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
      quantity: { type: Number, default: 0 }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);