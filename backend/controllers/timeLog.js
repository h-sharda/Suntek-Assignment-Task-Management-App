const TimeLog = require("../models/TimeLog");
const Task = require("../models/Task");
const DailySummary = require("../models/DailySummary");

/**
 * @desc    Start time tracking for a task
 * @route   POST /api/time-logs/start/:taskId
 * @access  Private
 */
exports.startTimeTracking = async (req, res) => {
  try {
    const { taskId } = req.params;

    // Check if task exists and belongs to user
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this task",
      });
    }

    // Check if there's already an active time log for this task
    const activeTimeLog = await TimeLog.findOne({
      task: taskId,
      user: req.user.id,
      endTime: null,
      isActive: true,
    });

    if (activeTimeLog) {
      return res.status(400).json({
        success: false,
        message: "Time tracking is already active for this task",
      });
    }

    // Create a new time log
    const now = new Date();
    const timeLog = await TimeLog.create({
      task: taskId,
      user: req.user.id,
      startTime: now,
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
      isActive: true,
    });

    // Update task status to "In Progress" if it's not already
    if (task.status !== "In Progress") {
      task.status = "In Progress";
      task.statusHistory.push({
        status: "In Progress",
        changedAt: now,
      });
      await task.save();
    }

    res.status(201).json({
      success: true,
      data: timeLog,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Stop time tracking for a task
 * @route   POST /api/time-logs/stop/:timeLogId
 * @access  Private
 */
exports.stopTimeTracking = async (req, res) => {
  try {
    const timeLog = await TimeLog.findById(req.params.timeLogId);

    if (!timeLog) {
      return res.status(404).json({
        success: false,
        message: "Time log not found",
      });
    }

    // Check if time log belongs to user
    if (timeLog.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this time log",
      });
    }

    // Check if time log is already stopped
    if (timeLog.endTime) {
      return res.status(400).json({
        success: false,
        message: "Time tracking is already stopped for this task",
      });
    }

    // Stop time tracking
    const now = new Date();
    timeLog.endTime = now;
    timeLog.isActive = false;
    timeLog.duration = now - timeLog.startTime;
    await timeLog.save();

    // Update daily summary
    await updateDailySummary(timeLog);

    res.status(200).json({
      success: true,
      data: timeLog,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Pause time tracking for a task
 * @route   POST /api/time-logs/pause/:timeLogId
 * @access  Private
 */
exports.pauseTimeTracking = async (req, res) => {
  try {
    const timeLog = await TimeLog.findById(req.params.timeLogId);

    if (!timeLog) {
      return res.status(404).json({
        success: false,
        message: "Time log not found",
      });
    }

    // Check if time log belongs to user
    if (timeLog.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this time log",
      });
    }

    // Check if time log is already stopped
    if (timeLog.endTime) {
      return res.status(400).json({
        success: false,
        message: "Time tracking is already stopped for this task",
      });
    }

    // Stop time tracking
    const now = new Date();
    timeLog.endTime = now;
    timeLog.isActive = false;
    timeLog.duration = now - timeLog.startTime;
    await timeLog.save();

    // Update daily summary
    await updateDailySummary(timeLog);

    // Update task status to "On Hold" if it's not already
    const task = await Task.findById(timeLog.task);
    if (task && task.status === "In Progress") {
      task.status = "On Hold";
      task.statusHistory.push({
        status: "On Hold",
        changedAt: now,
      });
      await task.save();
    }

    res.status(200).json({
      success: true,
      data: timeLog,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get all time logs for a user
 * @route   GET /api/time-logs
 * @access  Private
 */
exports.getTimeLogs = async (req, res) => {
  try {
    const { taskId, date, startDate, endDate } = req.query;

    // Build query
    const query = { user: req.user.id };

    // Filter by task if provided
    if (taskId) {
      query.task = taskId;
    }

    // Filter by date if provided
    if (date) {
      const selectedDate = new Date(date);
      const nextDate = new Date(selectedDate);
      nextDate.setDate(selectedDate.getDate() + 1);

      query.startTime = {
        $gte: selectedDate,
        $lt: nextDate,
      };
    } else if (startDate && endDate) {
      // Filter by date range if provided
      query.startTime = {
        $gte: new Date(startDate),
        $lt: new Date(endDate),
      };
    }

    const timeLogs = await TimeLog.find(query)
      .sort({ startTime: -1 })
      .populate("task", "title status priority");

    res.status(200).json({
      success: true,
      count: timeLogs.length,
      data: timeLogs,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get time logs for a specific task
 * @route   GET /api/time-logs/task/:taskId
 * @access  Private
 */
exports.getTaskTimeLogs = async (req, res) => {
  try {
    const { taskId } = req.params;

    // Check if task exists and belongs to user
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this task",
      });
    }

    const timeLogs = await TimeLog.find({
      task: taskId,
      user: req.user.id,
    }).sort({ startTime: -1 });

    // Calculate total time spent
    const totalTimeSpent = timeLogs.reduce((total, log) => {
      if (log.duration) {
        return total + log.duration;
      }

      if (log.startTime && log.endTime) {
        return total + (log.endTime - log.startTime);
      }

      return total;
    }, 0);

    res.status(200).json({
      success: true,
      count: timeLogs.length,
      totalTimeSpent,
      data: timeLogs,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get active time logs for a user
 * @route   GET /api/time-logs/active
 * @access  Private
 */
exports.getActiveTimeLog = async (req, res) => {
  try {
    const activeTimeLogs = await TimeLog.find({
      user: req.user.id,
      endTime: null,
      isActive: true,
    }).populate("task", "title status priority");

    res.status(200).json({
      success: true,
      data: activeTimeLogs,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Helper function to update daily summary when a time log is stopped
 */
const updateDailySummary = async (timeLog) => {
  try {
    const dateObj = new Date(timeLog.date);
    const dateStr = dateObj.toISOString().split("T")[0];

    // Find or create daily summary for this date
    let dailySummary = await DailySummary.findOne({
      user: timeLog.user,
      date: {
        $gte: new Date(dateStr),
        $lt: new Date(new Date(dateStr).getTime() + 24 * 60 * 60 * 1000),
      },
    });

    if (!dailySummary) {
      dailySummary = new DailySummary({
        date: new Date(dateStr),
        user: timeLog.user,
        tasks: [],
        totalTimeSpent: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        pendingTasks: 0,
      });
    }

    // Get all tasks for this user on this date
    const tasks = await Task.find({
      user: timeLog.user,
      createdAt: {
        $gte: new Date(dateStr),
        $lt: new Date(new Date(dateStr).getTime() + 24 * 60 * 60 * 1000),
      },
    });

    // Reset task counts
    dailySummary.completedTasks = 0;
    dailySummary.inProgressTasks = 0;
    dailySummary.pendingTasks = 0;

    // Update task counts based on current status
    tasks.forEach((task) => {
      if (task.status === "Completed") {
        dailySummary.completedTasks++;
      } else if (task.status === "In Progress") {
        dailySummary.inProgressTasks++;
      } else {
        dailySummary.pendingTasks++;
      }
    });

    // Get all time logs for this date
    const timeLogs = await TimeLog.find({
      user: timeLog.user,
      date: {
        $gte: new Date(dateStr),
        $lt: new Date(new Date(dateStr).getTime() + 24 * 60 * 60 * 1000),
      },
    }).populate("task");

    // Reset tasks array and total time
    dailySummary.tasks = [];
    dailySummary.totalTimeSpent = 0;

    // Group time logs by task and calculate total time
    const taskTimeMap = new Map();
    timeLogs.forEach((log) => {
      const taskId = log.task._id.toString();
      const duration = log.duration || 0;

      if (taskTimeMap.has(taskId)) {
        taskTimeMap.get(taskId).timeSpent += duration;
      } else {
        taskTimeMap.set(taskId, {
          task: log.task._id,
          timeSpent: duration,
          status: log.task.status,
        });
      }
      dailySummary.totalTimeSpent += duration;
    });

    // Update tasks array with latest data
    dailySummary.tasks = Array.from(taskTimeMap.values());

    await dailySummary.save();
  } catch (error) {
    console.error("Error updating daily summary:", error);
    throw error;
  }
};
