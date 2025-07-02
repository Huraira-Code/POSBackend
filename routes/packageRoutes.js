const express = require("express");
const {
  createPackage,
  getPackages,
  updatePackage,
  deletePackage,
} = require("../controllers/packageController");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

// Superadmin only
router.post("/", verifyToken("superadmin"), createPackage);
router.get("/", getPackages); // public access (can be changed)
router.put("/:id", verifyToken("superadmin"), updatePackage);
router.delete("/:id", verifyToken("superadmin"), deletePackage);

module.exports = router;
