const express = require("express");
const {
  addBillsController,
  getBillsController,
  getAdminBillsController,
  createStripeSession,
  verifyStripeSession,
} = require("./../controllers/billsController");
const { verifyToken } = require("../middleware/authMiddleware");
const checkSubscription = require('../middleware/checkSubscription')

const router = express.Router();

//routes

//MEthod - POST
router.post("/add-bills",verifyToken("user"), addBillsController);

//MEthod - GET
router.get("/get-bills", verifyToken("user"),checkSubscription,getBillsController);
// routes/billsRoutes.js
router.get("/admin/bills", verifyToken("admin"),checkSubscription, getAdminBillsController);

// router.get('/admin-stats', getAdminStats);
router.post("/create-stripe-session",verifyToken(["admin","user"]), createStripeSession);
router.post("/verify-stripe-session",verifyToken(["admin","user"]),verifyStripeSession);
module.exports = router;
