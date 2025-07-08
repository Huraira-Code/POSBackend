const mongoose = require("mongoose");

const packageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    durationInDays: {
      type: Number,
      required: true, // e.g., 30 for 1 month
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Package", packageSchema);
