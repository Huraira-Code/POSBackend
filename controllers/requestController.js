const Request = require("../models/requestModel");

const createRequestController = async (req, res) => {
  try {
    const { packageId, durationInDays, amount } = req.body;

    const newRequest = new Request({
      user: req.user.id, // from token middleware
      packageId,
      durationInDays,
      amount,
      status: "pending",
    });

    await newRequest.save();
    res.status(200).json({ success: true, message: "Request submitted!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = { createRequestController };
