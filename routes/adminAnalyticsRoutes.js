const express = require("express");
const checkSubscription = require('../middleware/checkSubscription')

const router = express.Router();
const {
  getTotalSales,
  getTotalOrders,
  getMonthlySales,
  getTopCategories
} = require("../controllers/statsController");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/total-sales", verifyToken("admin"),checkSubscription, getTotalSales);
router.get("/total-orders", verifyToken("admin"),checkSubscription, getTotalOrders);
router.get("/monthly-sales", verifyToken("admin"),checkSubscription, getMonthlySales);
router.get("/top-categories", verifyToken("admin"),checkSubscription, getTopCategories);

module.exports = router;
