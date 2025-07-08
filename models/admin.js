const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  adminId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  number: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  packageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Package"
  },
  paymentMethods: {
    type: [String],
    enum: ["cash", "stripe"],
    default: ["cash"]
  },
  stripeSecret: {
    type: String,
    default: ""
  },
  createdAt: {
    type: Date,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ["active", "onHold"],
    default: "active"
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Admin", adminSchema);
