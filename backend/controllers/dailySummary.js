const DailySummary = require("../models/DailySummary");
const Task = require("../models/Task");
const TimeLog = require("../models/TimeLog");
const User = require("../models/User");
const aiService = require("../services/aiService");

/**
 * @desc    Get daily summaries for a user
 * @route   GET /api/daily-summaries
 * @access  Private
 */
exports.getDailySummaries = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build query
    const query = { user: req.user.id };

    // Filter by date range if provided
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const dailySummaries = await DailySummary.find(query)
      .sort({ date: -1 })
      .populate({
        path: "tasks.task",
        select: "title status priority",
      });

    // Update task statuses to ensure they're current
    for (const summary of dailySummaries) {
      for (let i = 0; i < summary.tasks.length; i++) {
        const task = await Task.findById(summary.tasks[i].task._id);
        if (task) {
          summary.tasks[i].status = task.status;
        }
      }
      await summary.save();
    }

    res.status(200).json({
      success: true,
      count: dailySummaries.length,
      data: dailySummaries,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get a single daily summary
 * @route   GET /api/daily-summaries/:id
 * @access  Private
 */
exports.getDailySummary = async (req, res) => {
  try {
    const dailySummary = await DailySummary.findById(req.params.id).populate({
      path: "tasks.task",
      select: "title status priority",
    });

    if (!dailySummary) {
      return res.status(404).json({
        success: false,
        message: "Daily summary not found",
      });
    }

    // Check if daily summary belongs to user
    if (dailySummary.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this daily summary",
      });
    }

    // Update task statuses to ensure they're current
    for (let i = 0; i < dailySummary.tasks.length; i++) {
      const task = await Task.findById(dailySummary.tasks[i].task._id);
      if (task) {
        dailySummary.tasks[i].status = task.status;
      }
    }
    await dailySummary.save();

    res.status(200).json({
      success: true,
      data: dailySummary,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get daily summary by date
 * @route   GET /api/daily-summaries/date/:date
 * @access  Private
 */
exports.getDailySummaryByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const dateObj = new Date(date);

    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Use YYYY-MM-DD",
      });
    }

    const nextDay = new Date(dateObj);
    nextDay.setDate(dateObj.getDate() + 1);

    let dailySummary = await DailySummary.findOne({
      user: req.user.id,
      date: {
        $gte: dateObj,
        $lt: nextDay,
      },
    }).populate({
      path: "tasks.task",
      select: "title status priority",
    });

    // If no summary exists for this date, generate one
    if (!dailySummary) {
      dailySummary = await generateDailySummary(req.user.id, dateObj);
    }

    res.status(200).json({
      success: true,
      data: dailySummary,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Generate summary for a daily summary
 * @route   POST /api/daily-summaries/:id/generate-summary
 * @access  Private
 */
exports.generateSummary = async (req, res) => {
  try {
    const dailySummary = await DailySummary.findById(req.params.id).populate({
      path: "tasks.task",
      select: "title status priority",
    });

    if (!dailySummary) {
      return res.status(404).json({
        success: false,
        message: "Daily summary not found",
      });
    }

    // Check if daily summary belongs to user
    if (dailySummary.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this daily summary",
      });
    }

    // Generate summary
    const aiResult = await aiService.generateDailySummary({
      completedTasks: dailySummary.completedTasks,
      inProgressTasks: dailySummary.inProgressTasks,
      pendingTasks: dailySummary.pendingTasks,
      totalTimeSpent: dailySummary.totalTimeSpent,
      tasks: dailySummary.tasks,
    });

    // Update summary
    dailySummary.summary = aiResult.summary;
    await dailySummary.save();

    res.status(200).json({
      success: true,
      data: dailySummary,
      aiMessage: aiResult.message,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Generate daily summary for a specific date
 * @route   POST /api/daily-summaries/generate
 * @access  Private
 */
exports.generateDailySummary = async (req, res) => {
  try {
    const { date } = req.body;
    const userId = req.user.id;

    // Get all time logs for the user on the specified date
    const timeLogs = await TimeLog.find({
      user: userId,
      date: date,
    }).populate("task");

    // Calculate total time spent
    const totalTimeSpent = timeLogs.reduce((total, log) => {
      return total + (log.duration || 0);
    }, 0);

    // Get all tasks for the user created on this date
    const tasks = await Task.find({
      user: userId,
      createdAt: {
        $gte: new Date(date),
        $lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1)),
      },
    });

    // Count tasks by status
    const taskCounts = {
      completed: 0,
      inProgress: 0,
      pending: 0,
    };

    tasks.forEach((task) => {
      if (task.status === "Completed") {
        taskCounts.completed++;
      } else if (task.status === "In Progress") {
        taskCounts.inProgress++;
      } else {
        taskCounts.pending++;
      }
    });

    // Create or update daily summary
    let dailySummary = await DailySummary.findOne({
      user: userId,
      date: date,
    });

    if (dailySummary) {
      dailySummary.totalTimeSpent = totalTimeSpent;
      dailySummary.completedTasks = taskCounts.completed;
      dailySummary.inProgressTasks = taskCounts.inProgress;
      dailySummary.pendingTasks = taskCounts.pending;
      await dailySummary.save();
    } else {
      dailySummary = await DailySummary.create({
        user: userId,
        date: date,
        totalTimeSpent,
        completedTasks: taskCounts.completed,
        inProgressTasks: taskCounts.inProgress,
        pendingTasks: taskCounts.pending,
      });
    }

    res.status(200).json({
      success: true,
      data: dailySummary,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Helper function to generate a daily summary for a specific date
 */
const generateDailySummary = async (userId, date) => {
  try {
    const dateStr = date.toISOString().split("T")[0];
    const startDate = new Date(dateStr);
    const endDate = new Date(new Date(dateStr).getTime() + 24 * 60 * 60 * 1000);

    // Get all time logs for this date
    const timeLogs = await TimeLog.find({
      user: userId,
      startTime: {
        $gte: startDate,
        $lt: endDate,
      },
    }).populate("task");

    // Group time logs by task
    const taskMap = new Map();
    let totalTimeSpent = 0;

    for (const log of timeLogs) {
      const taskId = log.task._id.toString();
      const duration =
        log.duration || (log.endTime ? log.endTime - log.startTime : 0);

      if (taskMap.has(taskId)) {
        taskMap.get(taskId).timeSpent += duration;
      } else {
        taskMap.set(taskId, {
          task: log.task._id,
          timeSpent: duration,
          status: log.task.status,
        });
      }

      totalTimeSpent += duration;
    }

    // Count tasks by status
    let completedTasks = 0;
    let inProgressTasks = 0;
    let pendingTasks = 0;

    // Get all tasks for this user
    const tasks = await Task.find({
      user: userId,
      createdAt: {
        $gte: startDate,
        $lt: endDate,
      },
    });

    // Count tasks by their current status
    for (const task of tasks) {
      if (task.status === "Completed") {
        completedTasks += 1;
      } else if (task.status === "In Progress") {
        inProgressTasks += 1;
      } else if (task.status === "Pending") {
        pendingTasks += 1;
      }
    }

    // Create daily summary
    const dailySummary = await DailySummary.create({
      date: startDate,
      user: userId,
      tasks: Array.from(taskMap.values()),
      totalTimeSpent,
      completedTasks,
      inProgressTasks,
      pendingTasks,
    });

    // Add daily summary to user's dailySummaries
    await User.findByIdAndUpdate(
      userId,
      { $push: { dailySummaries: dailySummary._id } },
      { new: true }
    );

    return dailySummary;
  } catch (error) {
    console.error("Error generating daily summary:", error);
    throw error;
  }
};
