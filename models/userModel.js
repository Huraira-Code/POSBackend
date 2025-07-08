
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  name: String,
  email: { type: String, required: true },
  number: String,
  password: { type: String, required: true },
  shopId: String,
  role:{ type: String, default:"user"},
  admin: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
