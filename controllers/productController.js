const Product = require("../models/Product");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const createProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      quantity,
      image,
      categoryId,
      priceType = "unit",
      pricingMode = "fixed",
      tierPricing = [],
      assignedStock = []
    } = req.body;

    const product = new Product({
      name,
      price: pricingMode === "fixed" ? price : 0,
      quantity,
      image,
      priceType,
      pricingMode,
      tierPricing,
      category: categoryId,
      admin: req.user.id,
      assignedStock
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: "Failed to create product", error });
  }
};


const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    const updatedFields = {
      ...req.body
    };

    // If pricing mode is tier, ensure price is 0
    if (req.body.pricingMode === "tier") {
      updatedFields.price = 0;
    }

    const updatedProduct = await Product.findOneAndUpdate(
      { _id: productId, admin: req.user.id },
      updatedFields,
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found or unauthorized" });
    }

    res.status(200).json({ message: "Product updated", product: updatedProduct });
  } catch (err) {
    res.status(500).json({ message: "Error updating product", error: err.message });
  }
};


function getTierPrice(value, tiers) {
  for (let t of tiers) {
    if (value >= t.min && (t.max === undefined || t.max === null || value <= t.max)) {
      return t.price;
    }
  }
  return null; // or fallback
}


  const deleteProduct = async (req, res) => {
    try {
      const productId = req.params.id;
      const deletedProduct = await Product.findOneAndDelete({
        _id: productId,
        admin: req.user.id
      });
  
      if (!deletedProduct) {
        return res.status(404).json({ message: "Product not found or unauthorized" });
      }
  
      res.status(200).json({ message: "Product deleted", product: deletedProduct });
    } catch (err) {
      res.status(500).json({ message: "Error deleting product", error: err.message });
    }
  };
  const getProducts = async (req, res) => {
    try {
      const user = req.user;
      const { categoryId } = req.query;
  
      let filter = {};
  
      if (user.role === "admin") {
        filter.admin = user.id;
      } else if (user.role === "user") {
        filter.admin = user.admin;
      } else {
        return res.status(403).json({ message: "Access denied" });
      }
  
      if (categoryId) {
        filter.category = categoryId; 
      }
  
      const products = await Product.find(filter).populate("category");
      return res.status(200).json(products);
    } catch (err) {
      res.status(500).json({ message: "Error fetching products", error: err.message });
    }
  };
  
const assignStockController = async (req, res) => {
  const { productId, userId, quantity } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).send("Product not found");

    const totalAssigned = product.assignedStock.reduce((sum, u) => sum + u.quantity, 0);

    const available = product.quantity - totalAssigned;
    if (quantity > available) {
      return res.status(400).send("Not enough stock available to assign");
    }

    // Update or add assigned stock
    const index = product.assignedStock.findIndex(item => item.userId.toString() === userId);
    if (index >= 0) {
      product.assignedStock[index].quantity += quantity;
    } else {
      product.assignedStock.push({ userId, quantity });
    }

    await product.save();
    res.send("Stock assigned to user successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};
// GET /api/products/user-stock/:userId
const getUserStockController = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    if (req.user.role === "user" && req.user.id !== userId) {
      return res.status(403).json({ message: "Forbidden access" });
    }
    
    console.log(userId,"addad");
    const products = await Product.find({
      "assignedStock.userId": new ObjectId(userId)
    });
    console.log(userId,"adasdad");
    const userStocks = products.map(prod => {
      const stockList = Array.isArray(prod.assignedStock) ? prod.assignedStock : [];

      const userStock = stockList.find(
        (u) => u?.userId?.toString?.() === userId
      );

      return {
        productId: prod._id,
        name: prod.name,
        assignedQuantity: userStock?.quantity || 0
      };
    });

    res.status(200).json(userStocks);
  } catch (error) {
    console.error("Stock Fetch Error:", error);
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};


  module.exports={getProducts,createProduct,updateProduct,deleteProduct,assignStockController,getUserStockController,getTierPrice}
  