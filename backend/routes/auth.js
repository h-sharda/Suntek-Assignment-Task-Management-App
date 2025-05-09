const express = require("express");
const router = express.Router();
const {
  signup,
  signin,
  signout,
  getMe,
  verifyEmail,
  resendOTP,
  forgotPassword,
  resetPassword,
  skipVerification,
} = require("../controllers/auth");
const { protect } = require("../middlewares/auth");

// Auth routes
router.post("/signup", signup);
router.post("/skip-verification", skipVerification);
router.post("/verify-email", verifyEmail);
router.post("/resend-otp", resendOTP);
router.post("/signin", signin);
router.get("/signout", signout);
router.get("/me", protect, getMe);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password", resetPassword);

module.exports = router;
