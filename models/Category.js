const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" }
}, { timestamps: true });

module.exports = mongoose.model("Category", categorySchema);
