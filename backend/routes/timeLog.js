const express = require("express");
const router = express.Router();
const {
  startTimeTracking,
  stopTimeTracking,
  pauseTimeTracking,
  getTimeLogs,
  getTaskTimeLogs,
  getActiveTimeLog,
} = require("../controllers/timeLog");
const { protect } = require("../middlewares/auth");

// Time log routes
router.post("/start/:taskId", protect, startTimeTracking);
router.post("/stop/:timeLogId", protect, stopTimeTracking);
router.post("/pause/:timeLogId", protect, pauseTimeTracking);
router.get("/", protect, getTimeLogs);
router.get("/task/:taskId", protect, getTaskTimeLogs);
router.get("/active", protect, getActiveTimeLog);

module.exports = router;
