const Task = require("../models/Task");
const User = require("../models/User");
const TimeLog = require("../models/TimeLog");
const DailySummary = require("../models/DailySummary");
const aiService = require("../services/aiService");

/**
 * @desc    Create a new task
 * @route   POST /api/tasks
 * @access  Private
 */
exports.createTask = async (req, res) => {
  try {
    const { title, description, priority, deadline } = req.body;

    // Create task
    const task = await Task.create({
      title,
      description,
      priority,
      deadline: deadline ? new Date(deadline) : null,
      user: req.user.id,
    });

    // Add task to user's tasks
    await User.findByIdAndUpdate(
      req.user.id,
      { $push: { tasks: task._id } },
      { new: true }
    );

    res.status(201).json({
      success: true,
      data: task,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Create a task with AI assistance
 * @route   POST /api/tasks/ai
 * @access  Private
 */
exports.createTaskWithAI = async (req, res) => {
  try {
    const { userInput } = req.body;

    // Generate title using AI service
    const titleResult = await aiService.generateTaskTitle(userInput);

    // Generate description using AI service
    const descriptionResult = await aiService.generateTaskDescription(
      titleResult.title
    );

    // Create task
    const task = await Task.create({
      title: titleResult.title,
      description: descriptionResult.description,
      user: req.user.id,
    });

    // Add task to user's tasks
    await User.findByIdAndUpdate(
      req.user.id,
      { $push: { tasks: task._id } },
      { new: true }
    );

    res.status(201).json({
      success: true,
      data: task,
      aiMessages: {
        title: titleResult.message,
        description: descriptionResult.message,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get all tasks for a user
 * @route   GET /api/tasks
 * @access  Private
 */
exports.getTasks = async (req, res) => {
  try {
    const { status, priority, sortBy } = req.query;

    // Build query
    const query = { user: req.user.id };

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    // Filter by priority if provided
    if (priority) {
      query.priority = priority;
    }

    // Sort options
    let sort = {};

    if (sortBy === "priority") {
      // Sort by priority (Urgent > High > Medium > Low)
      sort = {
        priority: -1,
      };
    } else if (sortBy === "deadline") {
      // Sort by deadline (earliest first)
      sort = {
        deadline: 1,
      };
    } else {
      // Default sort by creation date (newest first)
      sort = {
        createdAt: -1,
      };
    }

    const tasks = await Task.find(query).sort(sort);

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get ongoing tasks for home page
 * @route   GET /api/tasks/ongoing
 * @access  Private
 */
exports.getOngoingTasks = async (req, res) => {
  try {
    const now = new Date();

    // Find tasks that are not completed or cancelled
    const query = {
      user: req.user.id,
      status: { $nin: ["Completed", "Cancelled"] },
    };

    const tasks = await Task.find(query);

    // Sort tasks according to requirements:
    // 1. Tasks with less than 5 minutes remaining at the top
    // 2. Then by priority
    const sortedTasks = tasks.sort((a, b) => {
      const aDeadline = a.deadline ? new Date(a.deadline) : null;
      const bDeadline = b.deadline ? new Date(b.deadline) : null;

      // Check if either task has less than 5 minutes remaining
      const aTimeRemaining = aDeadline ? aDeadline - now : Infinity;
      const bTimeRemaining = bDeadline ? bDeadline - now : Infinity;

      const aLessThan5Min = aTimeRemaining < 5 * 60 * 1000;
      const bLessThan5Min = bTimeRemaining < 5 * 60 * 1000;

      // If both have less than 5 minutes, sort by time remaining
      if (aLessThan5Min && bLessThan5Min) {
        return aTimeRemaining - bTimeRemaining;
      }

      // If only one has less than 5 minutes, it goes first
      if (aLessThan5Min) return -1;
      if (bLessThan5Min) return 1;

      // Otherwise sort by priority
      const priorityOrder = { Urgent: 4, High: 3, Medium: 2, Low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    res.status(200).json({
      success: true,
      count: sortedTasks.length,
      data: sortedTasks,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get a single task
 * @route   GET /api/tasks/:id
 * @access  Private
 */
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check if task belongs to user
    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this task",
      });
    }

    // Get time logs for this task
    const timeLogs = await TimeLog.find({ task: task._id }).sort({
      startTime: 1,
    });

    res.status(200).json({
      success: true,
      data: task,
      timeLogs,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Update a task
 * @route   PUT /api/tasks/:id
 * @access  Private
 */
exports.updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check if task belongs to user
    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to update this task",
      });
    }

    const { title, description, status, priority, deadline, remarks } =
      req.body;

    // Check if status is being updated
    if (status && status !== task.status) {
      task.statusHistory.push({
        status,
        changedAt: new Date(),
      });
    }

    // Check if priority is being updated
    if (priority && priority !== task.priority) {
      task.priorityHistory.push({
        priority,
        changedAt: new Date(),
      });
    }

    // Add remark if provided
    if (remarks) {
      task.remarks.push({
        text: remarks,
        createdAt: new Date(),
      });
    }

    // Update task fields
    task = await Task.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          title: title || task.title,
          description: description || task.description,
          status: status || task.status,
          priority: priority || task.priority,
          deadline: deadline ? new Date(deadline) : task.deadline,
        },
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Delete a task
 * @route   DELETE /api/tasks/:id
 * @access  Private
 */
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check if task belongs to user
    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to delete this task",
      });
    }

    // Delete all time logs associated with this task
    await TimeLog.deleteMany({ task: task._id });

    // Remove task from user's tasks array
    await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { tasks: task._id } },
      { new: true }
    );

    // Delete the task
    await task.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Update task status
 * @route   PATCH /api/tasks/:id/status
 * @access  Private
 */
exports.updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Please provide a status",
      });
    }

    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check if task belongs to user
    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to update this task",
      });
    }

    // Add to status history
    task.statusHistory.push({
      status,
      changedAt: new Date(),
    });

    // Update status
    task = await Task.findByIdAndUpdate(
      req.params.id,
      {
        $set: { status },
        $push: {
          statusHistory: {
            status,
            changedAt: new Date(),
          },
        },
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Update task priority
 * @route   PATCH /api/tasks/:id/priority
 * @access  Private
 */
exports.updateTaskPriority = async (req, res) => {
  try {
    const { priority } = req.body;

    if (!priority) {
      return res.status(400).json({
        success: false,
        message: "Please provide a priority",
      });
    }

    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check if task belongs to user
    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to update this task",
      });
    }

    // Update priority
    task = await Task.findByIdAndUpdate(
      req.params.id,
      {
        $set: { priority },
        $push: {
          priorityHistory: {
            priority,
            changedAt: new Date(),
          },
        },
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Add remark to task
 * @route   POST /api/tasks/:id/remarks
 * @access  Private
 */
exports.addRemark = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: "Please provide remark text",
      });
    }

    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check if task belongs to user
    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to update this task",
      });
    }

    // Add remark
    task = await Task.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          remarks: {
            text,
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
