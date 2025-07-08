// controllers/superAdminController.js
const Admin = require('../models/admin');
const User = require('../models/userModel');
const Request = require('../models/requestModel');
const Subscription = require('../models/subscriptionModel')
const Product = require('../models/Product');
const Category = require('../models/Category');
const getNewRequests = async (req, res) => {
  try {
    const requests = await Request.find().sort({ createdAt: -1 }); // newest first
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch requests", error: err.message });
  }
}

const getAllSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find().populate('adminId', 'adminId name email number password')
    res.status(200).json(subscriptions)
  } catch (err) {
    console.error("Error in getAllSubscriptions:", err)
    res.status(500).json({ message: "Failed to fetch subscriptions", error: err.message })
  }
}


const deleteSubscription = async (req, res) => {
  try {
    const { adminId } = req.params;

    // Step 1: Delete related Users
    await User.deleteMany({ admin: adminId });

    // Step 2: Delete related Products
    await Product.deleteMany({ admin: adminId });

    // Step 3: Delete related Categories
    await Category.deleteMany({ admin: adminId });

    // Step 4: Delete Subscription
    await Subscription.deleteOne({ adminId });

    // Step 5: Delete Request (if exists)
    await Request.deleteOne({ adminId });

    // Step 6: Delete Admin
    await Admin.findByIdAndDelete(adminId);

    res.status(200).json({ message: "Admin and all associated data deleted successfully." });
  } catch (error) {
    console.error("Error deleting admin and data:", error);
    res.status(500).json({ message: "Failed to delete admin", error: error.message });
  }
};

module.exports = {
  getNewRequests,getAllSubscriptions,deleteSubscription            
};