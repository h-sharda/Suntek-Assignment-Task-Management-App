const mongoose = require("mongoose");

const DailySummarySchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tasks: [
      {
        task: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Task",
        },
        timeSpent: {
          type: Number,
          default: 0,
        },
        status: {
          type: String,
          enum: ["Pending", "In Progress", "Completed", "On Hold", "Cancelled"],
        },
      },
    ],
    totalTimeSpent: {
      type: Number,
      default: 0,
    },
    completedTasks: {
      type: Number,
      default: 0,
    },
    inProgressTasks: {
      type: Number,
      default: 0,
    },
    pendingTasks: {
      type: Number,
      default: 0,
    },
    summary: {
      type: String,
      default: "",
    },
    dailyScore: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Create a compound index for user and date to ensure uniqueness
DailySummarySchema.index({ user: 1, date: 1 }, { unique: true });

// Pre-save middleware to update task counts
DailySummarySchema.pre("save", async function (next) {
  try {
    // Reset counts
    this.completedTasks = 0;
    this.inProgressTasks = 0;
    this.pendingTasks = 0;

    // Update counts based on current task statuses
    for (const taskItem of this.tasks) {
      if (taskItem.status === "Completed") {
        this.completedTasks++;
      } else if (taskItem.status === "In Progress") {
        this.inProgressTasks++;
      } else {
        this.pendingTasks++;
      }
    }

    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("DailySummary", DailySummarySchema);
