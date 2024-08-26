//src/service/imageService.js
import { client, Status, GenerationStyle } from "imaginesdk";
import { bucket, db } from '.../db.js'; // Import your Firebase setup
import { v4 as uuidv4 } from 'uuid'; // For generating unique filenames

const imagine = client(process.env.IMAGE_API_KEY);

export const generateImage = async (prompt, style = GenerationStyle.IMAGINE_V5) => {
  try {
    const response = await imagine.generations(prompt, { style });

    if (response.status() === Status.OK) {
      const image = response.data();

      if (image) {
        // Generate a unique filename for the image
        const fileName = `${uuidv4()}.png`;
        const file = bucket.file(fileName);

        // Upload the image to Firebase Storage
        await file.save(image);

        // Get the URL of the uploaded image
        const [url] = await file.getSignedUrl({
          action: 'read',
          expires: '03-01-2500', // Set an appropriate expiration date
        });

        // Store the image URL in Firestore
        const docRef = await db.collection('images').add({
          prompt,
          style,
          url,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Return the image URL
        return url;
      } else {
        throw new Error("No image data returned from API.");
      }
    } else {
      throw new Error(`Image generation failed with status code: ${response.status()}`);
    }
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error("Received non-JSON response from API:", error.message);
      throw new Error("Received an unexpected response from the image generation API. Please check the API key and request parameters.");
    } else {
      console.error("Error generating image:", error.message);
      throw new Error("Failed to generate image. Please try again later.");
    }
  }
};
