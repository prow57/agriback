//src/services/imageService.js
// Import necessary components from the imaginesdk
import { client, Status, GenerationStyle } from "imaginesdk";

// Initialize the client with your API key
const imagine = client(process.env.IMAGINE_API_KEY);

// Function to generate an image
export const generateImage = async (prompt, style = GenerationStyle.IMAGINE_V5) => {
  try {
    // Call the generations method with the prompt and style
    const response = await imagine.generations(prompt, { style });

    // Check if the response status is OK
    if (response.status() === Status.OK) {
      const image = response.data();
      
      // If image data is returned, return the image (you could also save it as a file)
      return image;
    } else {
      // If the response status is not OK, throw an error
      throw new Error(`Image generation failed with status code: ${response.status()}`);
    }
  } catch (error) {
    // Handle any errors during the API call
    console.error("Error generating image:", error.message);
    throw new Error("Failed to generate image. Please try again later.");
  }
};
