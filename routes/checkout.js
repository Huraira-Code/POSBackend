const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Request = require("../models/requestModel");
const Package = require("../models/packageModel");

// routes/checkout.js

router.post("/create-session", async (req, res) => {
  try {
    const { packageId, name, email } = req.body;
    const pkg = await Package.findById(packageId);
    if (!pkg) return res.status(404).json({ message: "Package not found" });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
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
});




router.get("/verify-session/:sessionId", async (req, res) => {
  const { sessionId } = req.params;
  const { name, email, packageId } = req.query;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      return res.status(400).json({ message: "Payment not completed" });
    }

    const alreadyExists = await Request.findOne({ stripeSessionId: sessionId });
    if (alreadyExists) return res.status(200).json({ message: "Already saved" });

    const selectedPackage = await Package.findById(packageId);
    if (!selectedPackage) return res.status(404).json({ message: "Package not found." });

    await Request.create({
      name,
      email,
      packageId,
      packageName: selectedPackage.title,
      amount: selectedPackage.amount,
      paymentTime: new Date(session.created * 1000),
      stripeSessionId: sessionId
    });

    return res.status(200).json({ message: "Payment verified & request saved" });
  } catch (err) {
    console.error("Session verify error:", err.message);
    return res.status(500).json({ message: "Error verifying session" });
  }
});


