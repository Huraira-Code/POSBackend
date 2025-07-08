const { get } = require("mongoose");
const User = require("../models/userModel");
const billsModel = require("../models/billsModel");
const { getTrustedUtcDate } = require("../utils/dateUtils");
const getTotalSales = async (req, res) => {
  try {
    const users = await User.find({ admin: req.user.id });
    const userIds = users.map((u) => u._id);

    const result = await billsModel.aggregate([
      { $match: { user: { $in: userIds } } },
      { $group: { _id: null, totalSales: { $sum: "$totalAmount" } } }
    ]);

    res.json({ totalSales: result[0]?.totalSales || 0 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch total sales" });
  }
};
const getTotalOrders = async (req, res) => {
  try {
    const users = await User.find({ admin: req.user.id });
    const userIds = users.map((u) => u._id);

    const count = await billsModel.countDocuments({ user: { $in: userIds } });
    res.json({ totalOrders: count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch total orders" });
  }
};
const getMonthlySales = async (req, res) => {
  try {
      // Clear the cache before fetching trusted date
    const adminId = req.user.id;
    const users = await User.find({ admin: adminId }).select("_id");
    const userIds = users.map(u => u._id);

    // Last 12 months range
    const start = await getTrustedUtcDate();
    start.setMonth(start.getMonth() - 11);
    start.setDate(1);
    start.setHours(0, 0, 0, 0);

    const trustedNow = new Date()
    console.log('Trusted current date (now):', trustedNow.toISOString());
    console.log('Calculated start date (12 months ago):', start.toISOString());

    const sales = await billsModel.aggregate([
      {
        $match: {
          user: { $in: userIds },
          date: { $gte: start },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          total: { $sum: "$totalAmount" },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    // Build a map for quick lookup
    const salesMap = {};
    sales.forEach(({ _id, total }) => {
      salesMap[`${_id.year}-${_id.month}`] = total;
    });

    // Build the last 12 months array, oldest to newest
    const result = [];
    const now = await getTrustedUtcDate()
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth() + 1; // JS months are 0-based
      const label = d.toLocaleString('default', { month: 'short' });
      const key = `${year}-${month}`;
      result.push({
        month: label,
        year,
        sales: salesMap[key] || 0,
      });
    }

    return res.json(result);
  } catch (err) {
    console.error("Monthly sales error:", err);
    res.status(500).send("Server error");
  }
};

;
const getTopCategories = async (req, res) => {
  try {
    const adminId = req.user.id;

    const users = await User.find({ admin: adminId }, "_id");
    const userIds = users.map(u => u._id);

    const bills = await billsModel.find({ user: { $in: userIds } });

    const categoryMap = {};

    bills.forEach(bill => {
      bill.cartItems.forEach(item => {
        const name = item.category?.name || "Unknown";
        categoryMap[name] = (categoryMap[name] || 0) + 1;
      });
    });

    const result = Object.entries(categoryMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 4); // Top 4

    res.json(result);
  } catch (err) {
    console.error("Top Categories Error:", err);
    res.status(500).send("Server Error");
  }
};


module.exports = {
  getTotalSales,getMonthlySales,getTotalOrders,getTopCategories};