const { InferenceClient } = require("@huggingface/inference");

const config = {
  apiKey: process.env.HUGGING_FACE_API_KEY,
  model: process.env.HUGGING_FACE_MODEL,
  provider: process.env.HUGGING_FACE_PROVIDER,
  maxLength: 100,
  temperature: 0.7,
};

const client = new InferenceClient(config.apiKey);

/**
 * Generate AI response using the configured model
 * @param {string} prompt - The prompt to send to the AI
 * @returns {Promise<string>} The AI generated response
 */
const generateAIResponse = async (prompt) => {
  try {
    const chatCompletion = await client.chatCompletion({
      provider: config.provider,
      model: config.model,
      maxLength: config.maxLength,
      temperature: config.temperature,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ],
    });

    return chatCompletion.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error generating AI response:", error.message);
    throw error;
  }
};

module.exports = {
  config,
  generateAIResponse,
};
