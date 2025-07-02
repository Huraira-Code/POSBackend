const Package = require("../models/packageModel");

// Create Package
const createPackage = async (req, res) => {
  try {
    const { title, amount, durationInDays } = req.body;
    const newPackage = new Package({ title, amount, durationInDays });
    await newPackage.save();
    res.status(201).json({ message: "Package created successfully", newPackage });
  } catch (error) {
    console.error("Create Package Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get All Packages
const getPackages = async (req, res) => {
  try {
    const packages = await Package.find();
    res.status(200).json(packages);
  } catch (error) {
    console.error("Get Packages Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update Package
const updatePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, amount, durationInDays } = req.body;
    const updated = await Package.findByIdAndUpdate(
      id,
      { title, amount, durationInDays },
      { new: true }
    );
    res.status(200).json({ message: "Package updated", updated });
  } catch (error) {
    console.error("Update Package Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete Package
const deletePackage = async (req, res) => {
  try {
    const { id } = req.params;
    await Package.findByIdAndDelete(id);
    res.status(200).json({ message: "Package deleted" });
  } catch (error) {
    console.error("Delete Package Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  createPackage,
  getPackages,
  updatePackage,
  deletePackage,
};
