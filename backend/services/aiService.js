const { generateAIResponse } = require("../configs/huggingFace");

/**
 * @desc Generate a clear title for a task based on user input
 * @param {string} userInput - The user's natural language input
 * @returns {Promise<{title: string, message: string}>} - AI generated task title and status message
 */
exports.generateTaskTitle = async (userInput) => {
  try {
    const prompt = `Given the user input: "${userInput}", generate a clear task title. Respond with just the title.`;
    const title = await generateAIResponse(prompt);

    return {
      title,
      message: "Task title generated successfully",
    };
  } catch (error) {
    return {
      title: userInput.trim(),
      message: "Failed to generate AI title, using input as fallback",
    };
  }
};

/**
 * @desc Generate a structured description for a task based on its title
 * @param {string} title - The task title
 * @returns {Promise<{description: string, message: string}>} - AI generated task description and status message
 */
exports.generateTaskDescription = async (title) => {
  try {
    const prompt = `Generate a short and crisp task description for: "${title}". Return the output in plain text only. Do not use any markdown formatting, bullet points, or special characters—just plain sentences.`;
    const description = await generateAIResponse(prompt);

    return {
      description,
      message: "Task description generated successfully",
    };
  } catch (error) {
    return {
      description: `Description for "${title}"`,
      message: "Failed to generate AI description, using fallback",
    };
  }
};

/**
 * @desc Generate a daily summary based on task activities
 * @param {Object} dailyData - Information about daily activities and statuses
 * @returns {Promise<{summary: string, message: string}>} - AI generated summary and status message
 */
exports.generateDailySummary = async (dailyData) => {
  const { completedTasks, inProgressTasks, pendingTasks, totalTimeSpent } =
    dailyData;

  const hours = Math.floor(totalTimeSpent / (1000 * 60 * 60));
  const minutes = Math.floor((totalTimeSpent % (1000 * 60 * 60)) / (1000 * 60));

  return {
    summary: `You spent ${hours}h ${minutes}m working today. Completed ${completedTasks} tasks, ${inProgressTasks} tasks in progress, and ${pendingTasks} tasks pending.`,
    message: "Daily summary generated successfully",
  };
};
