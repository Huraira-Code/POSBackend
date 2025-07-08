const { get } = require("mongoose");
const Admin = require("../models/admin");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");



const createUser = async (req, res) => {
  try {
    const adminId = req.user.id;
    const userCount = await User.countDocuments({ admin: adminId });
    if (userCount >= 4) return res.status(400).json({ message: "User limit reached" });
console.log("id",adminId)
    const newUser = new User({ ...req.body, admin: adminId });
    await newUser.save();
    console.log("Saved user:", newUser);
    await Admin.findByIdAndUpdate(adminId, {
      $push: { users: newUser._id }
    });
    res.status(201).json({ message: "User created", newUser });
  } catch (err) {
    res.status(500).json({ message: "Error creating user", error: err.message });
  }
};
const getUsersByAdmin = async (req, res) => {
  try {
    const adminId = req.user.id;
    const users = await User.find({ admin: adminId }).select("email shopId password name userId");
    res.status(200).json(users);
  } catch (error) {
    console.error("Admin fetch users error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// GET /api/admin/users/count
const getUserCount = async (req, res) => {
  try {
    const count = await User.countDocuments({ admin: req.user.id });
    res.status(200).json({ count });
  } catch (err) {
    res.status(500).json({ message: "Error fetching user count" });
  }
};

  // Update Password
 updatePassword = async (req, res) => {
    try {
      const { oldPassword, newPassword } = req.body;
      const admin = await Admin.findById(req.user.id);
      if (!admin) return res.status(404).json({ message: "Admin not found" });

      // Check if old password matches (plain text comparison since old passwords are not hashed)
      if (oldPassword !== admin.password) {
        return res.status(400).json({ message: "Old password incorrect" });
      }

      // Hash the new password before saving
      admin.password = await bcrypt.hash(newPassword, 10);
      await admin.save();
      res.json({ message: "Password updated successfully" });
    } catch (err) {
      console.error("Update password error:", err);
      res.status(500).json({ message: "Server error" });
    }
  };

const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select("-password");
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    res.json(admin);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Update admin profile
const updateAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findByIdAndUpdate(
      req.user.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).select("-password");
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    res.json(admin);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const getPaymentModes = async (req, res) => {
  try {
    const { adminId } = req.params;

    const admin = await Admin.findById(adminId);
    if (!admin) return res.status(404).json({ error: "Admin not found" });

    res.json({
      modes: admin.paymentMethods || ["cash"],
      stripeKey: admin.stripeSecret || null
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
module.exports = { createUser,getUsersByAdmin,getUserCount,updatePassword ,getAdminProfile,updateAdminProfile,getPaymentModes};
