const express = require("express");
const router = express.Router();
const {
  updateDetails,
  updateEmail,
  updatePassword,
} = require("../controllers/user");
const { protect, verifiedOnly } = require("../middlewares/auth");

// User routes
router.put("/update-details", protect, updateDetails);
router.post("/update-email", protect, updateEmail);
router.put("/update-password", protect, updatePassword);

module.exports = router;
