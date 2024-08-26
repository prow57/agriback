//src/services/imageService.js
const axios = require('axios');

const generateImage = async (prompt, styleId, aspectRatio = '1:1') => {
  const apiUrl = 'https://api.vyro.ai/v1/imagine/api/generations';
  const apiKey = process.env.IMAGINE_API_KEY;

  const formData = new FormData();
  formData.append('prompt', prompt);
  formData.append('style_id', styleId);
  formData.append('aspect_ratio', aspectRatio);

  try {
    const response = await axios.post(apiUrl, formData, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
};

module.exports = { generateImage };
