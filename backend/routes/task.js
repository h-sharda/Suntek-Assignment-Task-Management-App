const express = require("express");
const router = express.Router();
const {
  createTask,
  createTaskWithAI,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  updateTaskPriority,
  addRemark,
  getOngoingTasks,
} = require("../controllers/task");
const { protect } = require("../middlewares/auth");

// Task routes
router.post("/", protect, createTask);
router.post("/ai", protect, createTaskWithAI);
router.get("/", protect, getTasks);
router.get("/ongoing", protect, getOngoingTasks);
router.get("/:id", protect, getTask);
router.put("/:id", protect, updateTask);
router.delete("/:id", protect, deleteTask);
router.patch("/:id/status", protect, updateTaskStatus);
router.patch("/:id/priority", protect, updateTaskPriority);
router.post("/:id/remarks", protect, addRemark);

module.exports = router;
