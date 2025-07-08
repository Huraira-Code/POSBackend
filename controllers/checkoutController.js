const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Request = require("../models/requestModel");
const Package = require("../models/packageModel");
const Admin = require("../models/admin");


// const createCheckoutSession=async (req, res) => {
//   try {
//     const { packageId, name, email ,type} = req.body;
//     const pkg = await Package.findById(packageId);
//     if (!pkg) return res.status(404).json({ message: "Package not found" });

//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       line_items: [{
//         price_data: {
//           currency: "usd",
//           product_data: {
//             name: pkg.title,
//           },
//           unit_amount: pkg.amount * 100,
//         },
//         quantity: 1,
//       }],
//       mode: "payment",
//       success_url: `http://localhost:3000/payment-success?session_id={CHECKOUT_SESSION_ID}&name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&packageId=${pkg._id}&type=${type}`,

//       cancel_url: "http://localhost:3000",
//     });

//     return res.status(200).json({ sessionId: session.id });
//   } catch (err) {
//     console.error("Stripe session error:", err);
//     return res.status(500).json({ message: "Failed to create Stripe session" });
//   }
// }
const createCheckoutSession = async (req, res) => {
  try {
    const { packageId, name, email } = req.body;
    const pkg = await Package.findById(packageId);
    if (!pkg) return res.status(404).json({ message: "Package not found" });

    //   Check if email already exists (DOUBLE VALIDATION)
    const existingRequest = await Request.findOne({ email });
    const existingAdmin = await Admin.findOne({ email });

    if (existingRequest || existingAdmin) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: {
            name: pkg.title,
          },
          unit_amount: pkg.amount * 100,
        },
        quantity: 1,
      }],
      mode: "payment",
      success_url: `http://localhost:3000/payment-success?session_id={CHECKOUT_SESSION_ID}&name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&packageId=${pkg._id}`,
      cancel_url: "http://localhost:3000",
    });

    return res.status(200).json({ sessionId: session.id });
  } catch (err) {
    console.error("Stripe session error:", err);
    return res.status(500).json({ message: "Failed to create Stripe session" });
  }
};



const verifyCheckoutSession = async (req, res) => {
  const { sessionId } = req.params;
  const { name, email, packageId, type } = req.query;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      return res.status(400).json({ message: "Payment not completed" });
    }

    const alreadyExists = await Request.findOne({ stripeSessionId: sessionId });
    if (alreadyExists) return res.status(200).json({ message: "Already saved" });

    const selectedPackage = await Package.findById(packageId);
    if (!selectedPackage) return res.status(404).json({ message: "Package not found." });

    const requestData = {
      name,
      email,
      packageId,
      packageName: selectedPackage.title,
      amount: selectedPackage.amount,
      paymentTime: new Date(session.created * 1000),
      stripeSessionId: sessionId,
      isRenewal: type === "renew"
    };

    if (type === "renew") {
      const admin = await Admin.findOne({ email });
      if (!admin) return res.status(404).json({ message: "Admin not found for renewal" });
      requestData.adminId = admin._id;
    }

    await Request.create(requestData);
    return res.status(200).json({ message: "Payment verified & request saved" });
  } catch (err) {
    console.error("Session verify error:", err.message);
    return res.status(500).json({ message: "Error verifying session" });
  }
};



const checkEmailController = async (req, res) => {
  const { email } = req.query;

  if (!email) return res.status(400).json({ message: "Email is required" });

  const existingRequest = await Request.findOne({ email });
  const existingAdmin = await Admin.findOne({ email });

  if (existingRequest || existingAdmin) {
    return res.status(409).json({ message: "Email already exists" });
  }

  return res.status(200).json({ message: "Email is available" });
};

module.exports = {
  createCheckoutSession, verifyCheckoutSession,checkEmailController 
}