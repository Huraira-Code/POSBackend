const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  adminId: {
    type: String,
    required: true,
    unique: true // Ensure adminId is unique (e.g., "admin-001")
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true // Email must also be unique
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
