const { get } = require("mongoose");
const billsModel = require("../models/billsModel");
const User=require("../models/userModel")
const Product = require("../models/Product");
const Admin=require("../models/admin")
const Stripe=require("stripe")
const PendingBill = require("../models/pendingBillModel");

const reduceStockOnCheckout = async (cartItems, userId) => {
  for (const item of cartItems) {
    const product = await Product.findById(item._id);
    if (!product) continue;

    // Reduce stock for user
    const assigned = product.assignedStock.find(
      (s) => s.userId.toString() === userId.toString()
    );

    // Calculate used stock based on priceType
    let usedStock = 0;
    if (product.priceType === "sqft") {
      usedStock = (item.inputs?.width || 0) * (item.inputs?.height || 0) * (item.quantity || 0);
    } else if (product.priceType === "lf") {
      usedStock = (item.inputs?.length || 0) * (item.quantity || 0);
    } else {
      usedStock = item.quantity || 0;
    }

    if (!assigned || assigned.quantity < usedStock) {
      throw new Error(`Not enough stock for product ${product.name}`);
    }

    assigned.quantity -= usedStock;
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

const createStripeSession = async (req, res) => {
  try {
    const {
      customerName,
      customerNumber,
      paymentMode,
      cartItems,
      subTotal,
      tax,
      totalAmount,
      userId,
      adminId,
    } = req.body;

    if (!customerName || !customerNumber || !cartItems?.length || !userId || !adminId) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const admin = await Admin.findById(adminId);
    if (!admin) return res.status(404).json({ message: "Admin not found." });
    if (!admin.stripeSecret)
      return res.status(400).json({ message: "Stripe key missing for this admin." });

    const stripe = new Stripe(admin.stripeSecret);

    // Save full cart and customer info in PendingBill
    const pendingBill = await PendingBill.create({
      customerName,
      customerNumber,
      paymentMode,
      cartItems,
      subTotal,
      tax,
      totalAmount,
      user: userId,
      admin: adminId,
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd", // use 'usd' for testing
            product_data: { name: `POS Order - ${customerName}` },
            unit_amount: Math.round(totalAmount * 100), // convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      metadata: {
        pendingBillId: pendingBill._id.toString(), // Only store the reference
      },
      success_url: `${process.env.CLIENT_URL}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cart`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("⚠️ Stripe Error:", err.message);
    return res.status(500).json({ message: "Stripe session creation failed", error: err.message });
  }
}
const verifyStripeSession = async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ message: "Session ID is required" });

    const userId = req.user.id;

    const admin = await Admin.findOne({ users: userId });
    if (!admin || !admin.stripeSecret)
      return res.status(400).json({ message: "Admin or Stripe Key not found" });

    const stripeInstance = require("stripe")(admin.stripeSecret);
    const session = await stripeInstance.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return res.status(400).json({ message: "Payment not completed" });
    }

    // Retrieve the full cart and customer info from PendingBill
    const pendingBillId = session.metadata.pendingBillId;
    const pendingBill = await PendingBill.findById(pendingBillId);
    if (!pendingBill) {
      return res.status(404).json({ message: "Pending bill not found" });
    }

    const billData = {
      customerName: pendingBill.customerName,
      customerNumber: pendingBill.customerNumber,
      paymentMode: "stripe",
      subTotal: pendingBill.subTotal,
      tax: pendingBill.tax,
      totalAmount: pendingBill.totalAmount,
      cartItems: pendingBill.cartItems,
      user: pendingBill.user,
    };

    const bill = await billsModel.create(billData);
    // Optionally, delete the pending bill after use
    await PendingBill.findByIdAndDelete(pendingBillId);

    return res.status(200).json({ message: "Bill saved", bill });
  } catch (err) {
    console.error("Stripe Verify Error:", err);
    return res.status(500).json({ message: "Stripe session verification failed" });
  }
};




module.exports = {
  addBillsController,
  getBillsController,
  getAdminBillsController,
  createStripeSession,
  verifyStripeSession
};
