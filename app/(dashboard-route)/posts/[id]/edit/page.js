'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ChevronLeftIcon, 
  ArrowDownTrayIcon, 
  CloudArrowUpIcon, 
  PhotoIcon, 
  TagIcon, 
  UserIcon, 
  CalendarIcon, 
  InformationCircleIcon, 
  ExclamationCircleIcon, 
  LinkIcon as HeroLinkIcon, 
  XMarkIcon, 
  Bars3Icon 
} from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic';
import { useForm } from 'react-hook-form';
import { getPostById, updatePost, uploadImage, getAllAuthors } from '@/app/services/apiService';
import AuthorSelectInput from '@/components/AuthorSelectInput';

// Import React Quill dynamically to avoid SSR issues
const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import('react-quill-new');
    return RQ;
  },
  { ssr: false }
);

// Import Quill CSS
import 'react-quill-new/dist/quill.snow.css';

// Rich text editor toolbar options
const toolbarOptions = [
  [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
  [{ 'indent': '-1'}, { 'indent': '+1' }],
  [{ 'align': [] }],
  ['link', 'image', 'blockquote', 'code-block'],
  [{ 'color': [] }, { 'background': [] }],
  ['clean']
];

export default function EditPostPage({ params }) {
  // Properly unwrap the params Promise as recommended in Next.js 15.3.0
  const unwrappedParams = React.use(params);
  const postId = unwrappedParams.id;
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, watch, reset } = useForm();
  
  const [content, setContent] = useState('');
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState(null);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  
  // Fetch post data and authors on component mount
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch post data
        const postData = await getPostById(postId);
        
        // Fetch authors
        const authorsData = await getAllAuthors();
        
        // Set form values
        reset({
          title: postData.title,
          authorId: postData.authorId,
          img: postData.img || '',
          published: postData.published !== undefined ? postData.published : true
        });
        
        // Set tags
        if (postData.tags && Array.isArray(postData.tags)) {
          setTags(postData.tags);
        }
        
        // Set content for the rich text editor
        setContent(postData.content || '');
        
        // Set image preview if exists
        if (postData.img) {
          setImagePreview(postData.img);
        }
        
        // Set authors for dropdown
        setAuthors(authorsData);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load post data. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [postId, reset]);
  
  // Handle image upload
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Create a preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
    
    setImageFile(file);
  };
  
  // Upload the selected image to Cloudinary
  const handleImageUpload = async () => {
    if (!imageFile) return '';
    
    try {
      setUploadingImage(true);
      const uploadResponse = await uploadImage(imageFile);
      
      if (uploadResponse && uploadResponse.url) {
        setValue('img', uploadResponse.url);
        return uploadResponse.url;
      }
      
      throw new Error('Failed to get image URL');
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Failed to upload image. Please try again.');
      return '';
    } finally {
      setUploadingImage(false);
    }
  };
  
  // Handle adding tags
  const handleAddTag = (e) => {
    e.preventDefault();
    if (!tagInput.trim()) return;
    
    // Split by commas or colons
    const newTags = tagInput
      .split(/[,:]/)
      .map(tag => tag.trim())
      .filter(tag => tag && !tags.includes(tag));
    
    if (newTags.length > 0) {
      setTags([...tags, ...newTags]);
      setTagInput('');
    }
  };
  
  // Handle removing a tag
  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  // Form submission handler
  const onSubmit = async (data) => {
    try {
      setError(null);
      
      // Upload image if selected
      let imgUrl = data.img;
      if (imageFile) {
        imgUrl = await handleImageUpload();
        if (!imgUrl) return;
      }
      
      // Update post with API
      const postData = {
        ...data,
        img: imgUrl,
        content: content, // Use the content from the rich text editor
        tags: tags // Use the tags array
      };
      
      await updatePost(postId, postData);
      
      // Navigate to the posts page after successful update
      router.push('/posts');
    } catch (err) {
      console.error('Error updating post:', err);
      setError('Failed to update post. Please try again.');
    }
  };
  
  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[70vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-600 border-b-blue-200 border-l-blue-200 border-r-blue-200 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading post data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Link href="/posts" className="mr-4 text-gray-600 hover:text-gray-900 transition-colors">
            <ChevronLeftIcon className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Edit Post</h1>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left column - Main post content */}
          <div className="flex-1 space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="mb-6">
                <label htmlFor="title" className="inline-flex items-center text-base font-medium text-gray-700 mb-2">
                  <span className="bg-blue-50 p-1.5 rounded-md text-blue-600 mr-2">
                    <Bars3Icon className="h-5 w-5" />
                  </span>
                  Post Title
                </label>
                <input
                  id="title"
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter post title"
                  {...register('title', { required: 'Title is required' })}
                />
                {errors.title && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <InformationCircleIcon className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                    {errors.title.message}
                  </p>
                )}
              </div>
              
              <div>
                <label htmlFor="content" className="inline-flex items-center text-base font-medium text-gray-700 mb-2">
                  <span className="bg-blue-50 p-1.5 rounded-md text-blue-600 mr-2">
                    <Bars3Icon className="h-5 w-5" />
                  </span>
                  Content
                </label>
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <ReactQuill
                    theme="snow"
                    value={content}
                    onChange={setContent}
                    modules={{ toolbar: toolbarOptions }}
                    className="h-[450px]"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Right column - Settings and metadata */}
          <div className="lg:w-96 space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                <span className="bg-blue-50 p-1.5 rounded-md text-blue-600 mr-2">
                  <UserIcon className="h-5 w-5" />
                </span>
                Post Settings
              </h2>
              
              <div className="mb-4">
                <label htmlFor="authorId" className="inline-flex items-center text-sm font-medium text-gray-700 mb-2">
                  <UserIcon className="h-4 w-4 text-blue-500 mr-2" /> Author
                </label>
                <AuthorSelectInput
                  authors={authors}
                  selectedAuthorId={watch('authorId')}
                  onChange={(authorId) => setValue('authorId', authorId)}
                  error={errors.authorId?.message}
                />
                
                {/* Display selected author info below */}
                {watch('authorId') && (
                  <div className="mt-4 flex items-center p-3 bg-gray-50 rounded-lg">
                    {(() => {
                      const selectedAuthor = authors.find(a => a.id === watch('authorId'));
                      return selectedAuthor ? (
                        <>
                          <div className="flex-shrink-0 h-10 w-10">
                            {selectedAuthor.avatarUrl ? (
                              <Image
                                src={selectedAuthor.avatarUrl}
                                alt={selectedAuthor.name}
                                width={40}
                                height={40}
                                className="h-10 w-10 rounded-full object-cover border border-gray-200"
                                onError={(e) => {
                                  console.error('Author avatar failed to load:', selectedAuthor.avatarUrl);
                                  e.target.onerror = null;
                                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedAuthor.name)}&background=random`;
                                }}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                                {selectedAuthor.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{selectedAuthor.name}</p>
                            <p className="text-xs text-gray-500">{selectedAuthor.email}</p>
                          </div>
                        </>
                      ) : null;
                    })()}
                  </div>
                )}
              </div>
              
              <div className="mb-4">
                <label htmlFor="tags" className="inline-flex items-center text-sm font-medium text-gray-700 mb-2">
                  <span className="bg-blue-50 p-1.5 rounded-md text-blue-600 mr-2">
                    <TagIcon className="h-4 w-4" />
                  </span>
                  Tags
                </label>
                <div className="flex space-x-2 mb-3">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Add a tag..."
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    Add
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {tags.map((tag, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1.5 rounded-lg text-sm"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-blue-400 hover:text-blue-600"
                      >
                        <XMarkIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                
                <p className="text-xs text-gray-500">
                  Separate tags with commas or colons when typing (e.g., &quot;logistics, shipping&quot; or &quot;logistics: shipping&quot;)
                </p>
                
                {/* Hidden input to store tags for form submission */}
                <input
                  type="hidden"
                  {...register('tags')}
                  value={tags.join(',')}
                />
              </div>
              
              <div className="mb-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="published"
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    {...register('published')}
                  />
                  <label htmlFor="published" className="ml-2 block text-sm text-gray-700">
                    Published
                  </label>
                </div>
              </div>
            </div>
            
            {/* Featured Image */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                <span className="bg-blue-50 p-1.5 rounded-md text-blue-600 mr-2">
                  <PhotoIcon className="h-5 w-5" />
                </span>
                Featured Image
              </h2>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
                {imagePreview ? (
                  <div className="relative">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      width={400}
                      height={225}
                      className="mx-auto max-h-48 w-full rounded-lg object-cover shadow-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview('');
                        setImageFile(null);
                        setValue('img', '');
                      }}
                      className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 hover:bg-red-700 shadow-md transition-colors"
                      title="Remove image"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mt-2 flex justify-center">
                      <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                    </div>
                    <p className="mt-3 text-sm text-gray-600">
                      Drag and drop an image, or click to select a file
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </>
                )}
                
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="mt-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors"
                />
                
                <div className="relative mt-4">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <HeroLinkIcon className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Or enter image URL"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    {...register('img')}
                  />
                </div>
              </div>
            </div>
            
            {/* Submit Button */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <button
                type="submit"
                disabled={isSubmitting || uploadingImage}
                className="w-full inline-flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
              >
                <ArrowDownTrayIcon className="mr-2 h-4 w-4" />
                {isSubmitting || uploadingImage ? 'Saving...' : 'Save Changes'}
              </button>
              
              <Link
                href="/posts"
                className="mt-3 w-full inline-flex justify-center items-center px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Cancel
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
} 