import { NextResponse } from 'next/server';

// Helper function to handle form data parsing
const parseFormData = async (request) => {
  const formData = await request.formData();
  const file = formData.get('file');
  
  if (!file) {
    throw new Error('No file provided');
  }
  
  console.log('Received file:', file.name, 'Size:', file.size, 'Type:', file.type);
  return file;
};

// POST route to upload an image to Cloudinary
export async function POST(request) {
  try {
    console.log('Processing upload request');
    const file = await parseFormData(request);
    
    // Create a new FormData instance to send to Cloudinary
    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append('file', file);
    cloudinaryFormData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUD_PRESET_NAME);
    
    console.log('Uploading to Cloudinary with preset:', process.env.NEXT_PUBLIC_CLOUD_PRESET_NAME);
    
    // Upload to Cloudinary
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUD_NAME}/image/upload`;
    console.log('Cloudinary URL:', cloudinaryUrl);
    
    const response = await fetch(
      cloudinaryUrl,
      {
        method: 'POST',
        body: cloudinaryFormData,
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Cloudinary API error:', errorData);
      throw new Error(`Failed to upload image to Cloudinary: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Cloudinary upload successful, URL:', data.secure_url);
    
    return NextResponse.json(
      { 
        url: data.secure_url,
        publicId: data.public_id,
        format: data.format,
        width: data.width,
        height: data.height,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload image' },
      { status: 500 }
    );
  }
} 