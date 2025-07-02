const express = require("express");
const {
  addBillsController,
  getBillsController,
  getAdminBillsController,
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
module.exports = router;
