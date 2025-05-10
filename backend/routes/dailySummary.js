const express = require("express");
const router = express.Router();
const {
  getDailySummaries,
  getDailySummary,
  getDailySummaryByDate,
  generateAISummary,
} = require("../controllers/dailySummary");
const { protect } = require("../middlewares/auth");

// Daily summary routes
router.get("/", protect, getDailySummaries);
router.get("/date/:date", protect, getDailySummaryByDate);
router.get("/:id", protect, getDailySummary);
router.post("/:id/generate-summary", protect, generateAISummary);

module.exports = router;
