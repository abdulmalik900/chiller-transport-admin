/**
 * Utility functions for Cloudinary image uploads
 */

// Function to upload an image to Cloudinary
export async function uploadImageToCloudinary(file) {
  try {
    console.log('Starting Cloudinary upload with:', {
      cloudName: process.env.NEXT_PUBLIC_CLOUD_NAME,
      presetName: process.env.NEXT_PUBLIC_CLOUD_PRESET_NAME
    });
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUD_PRESET_NAME);
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Cloudinary upload failed:', errorData);
      throw new Error(`Failed to upload image: ${errorData.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Cloudinary upload successful, URL:', data.secure_url);
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    throw error;
  }
}

// Function to handle file uploads from the client
export function handleFileUpload(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = () => {
      resolve(reader.result);
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
  });
}

// Function to upload a base64 image to Cloudinary
export async function uploadBase64Image(base64Image) {
  try {
    const formData = new FormData();
    formData.append('file', base64Image);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUD_PRESET_NAME);
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to upload image');
    }
    
    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
} 