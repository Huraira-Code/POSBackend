const express = require("express");
const router = express.Router();
const { createUser, getUsersByAdmin, updatePassword, updateAdminProfile, getAdminProfile, getPaymentModes } = require("../controllers/adminController");
const { verifyToken } = require("../middleware/authMiddleware");
const { getUserCount } = require("../controllers/adminController");
const admin = require("../models/admin");
const bcrypt = require("bcrypt");
const checkSubscription = require('../middleware/checkSubscription');
router.post("/create-user", verifyToken("admin"), createUser);
router.get("/users", verifyToken("admin"),checkSubscription, getUsersByAdmin);
router.get("/users/count",checkSubscription,verifyToken("admin"), getUserCount);
router.get("/:adminId/payment-modes",verifyToken(["admin", "user"]) ,getPaymentModes);
router.put("/update-password", verifyToken("admin"),updatePassword);
router.get("/profile", verifyToken("admin"), getAdminProfile);
router.put("/profile", verifyToken("admin"), updateAdminProfile);


module.exports = router;
