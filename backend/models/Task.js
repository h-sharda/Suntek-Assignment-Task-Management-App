const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a task title"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed", "On Hold", "Cancelled"],
      default: "Pending",
    },
    startTime: {
      type: Date,
    },
    deadline: {
      type: Date,
    },
    endTime: {
      type: Date,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Urgent"],
      default: "Medium",
    },
    remarks: [
      {
        text: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    priorityHistory: [
      {
        priority: {
          type: String,
          enum: ["Low", "Medium", "High", "Urgent"],
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    statusHistory: [
      {
        status: {
          type: String,
          enum: ["Pending", "In Progress", "Completed", "On Hold", "Cancelled"],
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Add the initial status and priority to history when creating a new task
TaskSchema.pre("save", function (next) {
  if (this.isNew) {
    this.statusHistory.push({ status: this.status });
    this.priorityHistory.push({ priority: this.priority });
  }
  next();
});

module.exports = mongoose.model("Task", TaskSchema);
