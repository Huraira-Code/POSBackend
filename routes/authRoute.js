const express = require("express");
const router = express.Router();
const { superadminLogin, createAdmin,adminLogin, userLogin, checkExpiredAdmin } = require("../controllers/authController");
const { verifyToken } = require("../middleware/authMiddleware");
const { getNewRequests, getAllSubscriptions, deleteSubscription } = require("../controllers/superAdminController");
const subscriptionModel = require("../models/subscriptionModel");
const admin = require("../models/admin");
const { getTrustedUtcDate } = require('../utils/dateUtils');

router.post("/superadmin/login", superadminLogin);
router.post("/superadmin/create-admin", verifyToken("superadmin"), createAdmin);
// routes/superAdminRoutes.js
router.get('/superadmin/requests', verifyToken("superadmin"), getNewRequests);
router.get('/superadmin/subscriptions', verifyToken("superadmin"), getAllSubscriptions);
router.delete('/admin/:adminId', verifyToken('superadmin'),deleteSubscription);
// PATCH /api/auth/superadmin/approve-renewal/:requestId
router.patch("/approve-renewal/:requestId", verifyToken("superadmin"), async (req, res) => {
  try {
    const request = await Request.findById(req.params.requestId);
    if (!request || !request.isRenewal) {
      return res.status(404).json({ message: "Renewal request not found" });
    }

    const admin = await admin.findOne({ email: request.email });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const subscription = await subscriptionModel.findOne({ adminId: admin._id });
    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    // Use trusted UTC time
    const startDate = await getTrustedUtcDate();
    const endDate = new Date(startDate.getTime() + request.packageId.durationInDays * 24 * 60 * 60 * 1000);

    subscription.startDate = startDate;
    subscription.endDate = endDate;
    subscription.packageId = request.packageId;
    subscription.packageName = request.packageName;
    subscription.amount = request.amount;
    subscription.stripeSessionId = request.stripeSessionId;

    await subscription.save();
    await Request.findByIdAndDelete(req.params.requestId);

    res.status(200).json({ message: "Subscription renewed successfully" });
  } catch (error) {
    console.error("Renewal approval error:", error);
    res.status(500).json({ message: "Server error while approving renewal" });
  }
});

router.post("/admin/login", adminLogin);
router.post("/user/login", userLogin);
router.get("/check-expired-admin", checkExpiredAdmin);
module.exports = router;
