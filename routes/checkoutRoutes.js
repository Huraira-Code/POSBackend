const express = require("express");
const router = express.Router();
const { createCheckoutSession, verifyCheckoutSession, checkEmailController } = require("../controllers/checkoutController");

router.post("/create-session", createCheckoutSession);
router.get("/verify-session/:sessionId",verifyCheckoutSession);
router.get("/check-email", checkEmailController);

module.exports = router;
