/**
 * Unified API Service
 * Contains all API operations for the application
 */
import { uploadImageToCloudinary } from '@/lib/cloudinary';

// ==================
// UTILITY FUNCTIONS
// ==================

// Format a date to a readable string
export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Generate SEO-friendly slug from a title
export function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Helper function to determine if a value is a valid UUID
function isUUID(id) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

// ==================
// DASHBOARD OPERATIONS
// ==================

// Get dashboard statistics
export async function getDashboardStats() {
  const response = await fetch('/api/dashboard/stats');
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || errorData.error || 'Failed to fetch dashboard statistics');
  }
  
  return await response.json();
}

// ==================
// UPLOAD OPERATIONS
// ==================

// Upload an image using Cloudinary
export async function uploadImage(file) {
  try {
    // Check if file is valid
    if (!file || typeof file !== 'object') {
      throw new Error('Invalid file provided');
    }
    
    console.log('Starting image upload process for file:', file.name);
    
    // First try to use Cloudinary directly
    try {
      console.log('Attempting direct Cloudinary upload');
      const imageUrl = await uploadImageToCloudinary(file);
      console.log('Direct Cloudinary upload successful:', imageUrl);
      return { url: imageUrl, success: true };
    } catch (directError) {
      console.log('Direct upload failed, trying API route:', directError.message);
      
      // Fallback to the API route if direct upload fails
      const formData = new FormData();
      formData.append('file', file);
      
      console.log('Sending file to API upload route');
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API upload route failed:', errorData);
        throw new Error(errorData.error || `Upload failed with status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('API upload route success:', result);
      
      // Validate result contains a URL
      if (!result.url) {
        throw new Error('Upload succeeded but no URL was returned');
      }
      
      return result;
    }
  } catch (error) {
    console.error('Image upload failed:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
}

// ==================
// POST OPERATIONS
// ==================

// Get all posts
export async function getAllPosts() {
  const response = await fetch('/api/posts');
  
  if (!response.ok) {
    throw new Error('Failed to fetch posts');
  }
  
  return await response.json();
}

// Get a single post by ID
export async function getPostById(id) {
  const response = await fetch(`/api/posts/${id}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch post with ID: ${id}`);
  }
  
  return await response.json();
}

// Get a single post by slug
export async function getPostBySlug(slug) {
  const response = await fetch(`/api/posts/slug/${slug}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch post with slug: ${slug}`);
  }
  
  return await response.json();
}

// Create a new post
export async function createPost(postData) {
  // Generate slug if not provided
  if (!postData.slug && postData.title) {
    postData.slug = generateSlug(postData.title);
  }
  
  const response = await fetch('/api/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(postData),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to create post');
  }
  
  return await response.json();
}

// Update an existing post
export async function updatePost(id, postData) {
  // Generate slug if title changed and slug not provided
  if (postData.title && !postData.slug) {
    postData.slug = generateSlug(postData.title);
  }
  
  const response = await fetch(`/api/posts/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(postData),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Failed to update post with ID: ${id}`);
  }
  
  return await response.json();
}

// Delete a post
export async function deletePost(id) {
  const response = await fetch(`/api/posts/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Failed to delete post with ID: ${id}`);
  }
  
  return await response.json();
}

// Delete multiple posts
export async function deletePosts(ids) {
  const response = await fetch('/api/posts', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ids }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to delete posts');
  }
  
  return await response.json();
}

// ==================
// AUTHOR OPERATIONS
// ==================

// Get all authors
export async function getAllAuthors() {
  const response = await fetch('/api/authors');
  
  if (!response.ok) {
    throw new Error('Failed to fetch authors');
  }
  
  return await response.json();
}

// Get a single author by ID
export async function getAuthorById(id) {
  const response = await fetch(`/api/authors/${id}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch author with ID: ${id}`);
  }
  
  return await response.json();
}

// Create a new author
export async function createAuthor(authorData) {
  const response = await fetch('/api/authors', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(authorData),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to create author');
  }
  
  return await response.json();
}

// Update an existing author
export async function updateAuthor(id, authorData) {
  // Ensure we're using consistent field names
  const normalizedData = {
    ...authorData,
    avatarUrl: authorData.avatarUrl || authorData.image
  };
  
  const response = await fetch(`/api/authors/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(normalizedData),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Failed to update author with ID: ${id}`);
  }
  
  return await response.json();
}

// Delete an author
export async function deleteAuthor(id) {
  const response = await fetch(`/api/authors/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Failed to delete author with ID: ${id}`);
  }
  
  return await response.json();
}

// Delete multiple authors
export async function deleteAuthors(ids) {
  const response = await fetch('/api/authors', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ids }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to delete authors');
  }
  
  return await response.json();
}

// Get a post - will automatically determine if ID or slug was provided
export async function getPost(idOrSlug) {
  try {
    // If it looks like a UUID, fetch by ID, otherwise fetch by slug
    if (isUUID(idOrSlug)) {
      return await getPostById(idOrSlug);
    } else {
      return await getPostBySlug(idOrSlug);
    }
  } catch (error) {
    console.error(`Failed to fetch post: ${error.message}`);
    throw new Error(`Failed to fetch post: ${error.message}`);
  }
}

// Note: Authors only use IDs, not slugs 