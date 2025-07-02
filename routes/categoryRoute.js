const express = require("express");
const router = express.Router();
const {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory
} = require("../controllers/categoryController");
const { verifyToken } = require("../middleware/authMiddleware");
const checkSubscription = require('../middleware/checkSubscription')

router.post("/create", verifyToken("admin"), createCategory);
router.get("/", verifyToken("admin"),checkSubscription, getCategories);
router.get("/user-categories", verifyToken("user"),checkSubscription, getCategories);
router.put("/:id", verifyToken("admin"), updateCategory);
router.delete("/:id", verifyToken("admin"), deleteCategory);

module.exports = router;
