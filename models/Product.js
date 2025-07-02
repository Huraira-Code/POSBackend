const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  quantity:Number,
  image:String,
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
