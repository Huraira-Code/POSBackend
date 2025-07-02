const { get } = require("mongoose");
const billsModel = require("../models/billsModel");
const User=require("../models/userModel")
const Product = require("../models/Product");

const reduceStockOnCheckout = async (cartItems, userId) => {
  for (const item of cartItems) {
    const product = await Product.findById(item._id);
    if (!product) continue;

    // Reduce stock for user
    const assigned = product.assignedStock.find(
      (s) => s.userId.toString() === userId.toString()
    );

    if (!assigned || assigned.quantity < item.quantity) {
      throw new Error(`Not enough stock for product ${product.name}`);
    }

    assigned.quantity -= item.quantity;
    await product.save();
  }
};

//add items
const addBillsController = async (req, res) => {
  await reduceStockOnCheckout(req.body.cartItems, req.user.id); // use req.user.id directly
  try {
    const newBill = new billsModel({
      ...req.body,
      user: req.user.id, 
    })
await newBill.save();
res.send("Bill Created Successfully!");
  } catch (error) {
    res.send("something went wrong");
    console.log(error);
  }
};

//get blls data
const getBillsController = async (req, res) => {
  try {
    const bills = await billsModel.find({ user: req.user.id }).sort({ createdAt: -1 })
    res.send(bills);
  } catch (error) {
    console.log(error);
  }
};


const getAdminBillsController = async (req, res) => {
  try {
    const adminId = req.user.id;  // set by middleware

    // Step 1: Find all users created by this admin
    const users = await User.find({ admin: adminId });

    const userIds = users.map(user => user._id);

    // Step 2: Find all bills by those users
    const bills = await billsModel.find({ user: { $in: userIds } })
      // .populate("user", "userId name email") // optional: to get user info with bill
      .sort({ createdAt: -1 });

    res.status(200).json(bills);
  } catch (error) {
    console.error("Admin Get Bills Error:", error);
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};



module.exports = {
  addBillsController,
  getBillsController,
  getAdminBillsController
};
