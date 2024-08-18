// src/services/llamaAIService.js

const Groq = require("groq-sdk");

require('dotenv').config();

const groq = new Groq({ apiKey: process.env.LLAMA_AI_API_KEY });

const generateText = async (prompt) => {
  try {
    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama3-8b-8192",  // Adjust the model as per your requirement
    });

    return response.choices[0]?.message?.content || "";
  } catch (error) {
    console.error('Error generating text:', error);
    throw error;
  }
};

const generateImage = async (description) => {
  // Since Groq SDK example doesn't cover image generation, assume it's handled similarly.
  // Replace with the correct Groq method for image generation if available.
  try {
    const response = await groq.image.generate({ description });
    return response.data.image_url;
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
};

module.exports = {
  generateText,
  generateImage,
};
