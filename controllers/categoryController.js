const Category = require("../models/Category");

const createCategory = async (req, res) => {
    try {
      const { name } = req.body;
      const newCategory = new Category({
        name,
        admin: req.user.id
      });
      await newCategory.save();
      res.status(201).json(newCategory);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  };
  
 const getCategories = async (req, res) => {
  try {
    let categories;

    if (req.user.role === "admin") {
      // Admin sees only their own categories
      categories = await Category.find({ admin: req.user.id });
    } else if (req.user.role === "user" && req.user.admin) {
      // User sees only categories created by their admin
      categories = await Category.find({ admin: req.user.admin });
    } else {
      // Unauthorized or missing admin link
      return res.status(403).json({ message: "Access denied or not linked to an admin" });
    }

    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

  const updateCategory = async (req, res) => {
    try {
      const updated = await Category.findByIdAndUpdate(
        req.params.id,
        { name: req.body.name },
        { new: true }
      );
      res.status(200).json(updated);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  };
  
  const deleteCategory = async (req, res) => {
    try {
      await Category.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: "Deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  };
  
  //   CRUCIAL EXPORT
  module.exports = {
    createCategory,
    getCategories,
    updateCategory,
    deleteCategory
  };
  
