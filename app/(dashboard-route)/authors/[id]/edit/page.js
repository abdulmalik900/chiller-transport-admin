'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ChevronLeftIcon, 
  ArrowDownTrayIcon, 
  CloudArrowUpIcon, 
  UserIcon, 
  EnvelopeIcon, 
  BookOpenIcon, 
  InformationCircleIcon, 
  ExclamationCircleIcon, 
  LinkIcon as HeroLinkIcon, 
  XMarkIcon 
} from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { getAuthorById, updateAuthor, uploadImage } from '@/app/services/apiService';
import { use } from 'react';

export default function EditAuthorPage({ params }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const authorId = unwrappedParams.id;
  
  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, watch, reset } = useForm({
    defaultValues: {
      name: '',
      email: '',
      bio: '',
      avatarUrl: ''
    }
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Watch the avatarUrl field to update preview when URL is entered directly
  const avatarUrl = watch('avatarUrl');
  
  // Update image preview when avatarUrl changes
  useEffect(() => {
    if (avatarUrl && !imageFile) {
      setImagePreview(avatarUrl);
    }
  }, [avatarUrl, imageFile]);
  
  // Load author data
  useEffect(() => {
    async function loadAuthor() {
      try {
        setLoading(true);
        const author = await getAuthorById(authorId);
        console.log('Loaded author data:', {
          id: author.id,
          name: author.name, 
          email: author.email,
          avatarUrl: author.avatarUrl
        });
        
        // Set form values
        reset({
          name: author.name,
          email: author.email,
          bio: author.bio || '',
          avatarUrl: author.avatarUrl || ''
        });
        
        // Set image preview if available
        if (author.avatarUrl) {
          console.log('Setting image preview from avatarUrl:', author.avatarUrl);
          setImagePreview(author.avatarUrl);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error loading author:', err);
        setError('Failed to load author data. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    
    if (authorId) {
      loadAuthor();
    }
  }, [authorId, reset]);
  
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
  
  // Upload the selected image
  const handleImageUpload = async () => {
    if (!imageFile) return '';
    
    try {
      setUploadingImage(true);
      const uploadResponse = await uploadImage(imageFile);
      
      if (uploadResponse && uploadResponse.url) {
        setValue('avatarUrl', uploadResponse.url);
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
  
  // Form submission handler
  const onSubmit = async (data) => {
    try {
      setError(null);
      
      // Upload image if selected
      let imgUrl = data.avatarUrl;
      if (imageFile) {
        imgUrl = await handleImageUpload();
        if (!imgUrl) return;
      }
      
      // Update author with API
      const authorData = {
        ...data,
        avatarUrl: imgUrl
      };
      
      await updateAuthor(authorId, authorData);
      
      // Navigate to authors page after successful update
      router.push('/authors');
    } catch (err) {
      console.error('Error updating author:', err);
      setError('Failed to update author. Please try again.');
    }
  };
  
  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[70vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-600 border-b-blue-200 border-l-blue-200 border-r-blue-200 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading author data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Link href="/authors" className="mr-4 text-gray-600 hover:text-gray-900 transition-colors">
            <ChevronLeftIcon className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Edit Author</h1>
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
      
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Author profile image */}
            <div className="md:col-span-2 bg-gray-50 p-6 rounded-lg">
              <h2 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                <span className="bg-blue-50 p-1.5 rounded-md text-blue-600 mr-2">
                  <UserIcon className="h-5 w-5" />
                </span>
                Profile Image
              </h2>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-white">
                {imagePreview ? (
                  <div className="relative">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      width={192}
                      height={192}
                      className="mx-auto h-48 w-48 rounded-full object-cover shadow-lg border-2 border-white"
                      onError={(e) => {
                        // Fallback if image fails to load
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                        setImagePreview('');
                        setValue('avatarUrl', '');
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview('');
                        setImageFile(null);
                        setValue('avatarUrl', '');
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
                    {...register('avatarUrl')}
                  />
                  <button 
                    type="button" 
                    className="absolute inset-y-0 right-0 px-3 bg-blue-50 text-blue-600 rounded-r-md hover:bg-blue-100 transition-colors"
                    onClick={() => {
                      const url = watch('avatarUrl');
                      if (url) {
                        setImagePreview(url);
                        setImageFile(null);
                      }
                    }}
                  >
                    Preview
                  </button>
                </div>
              </div>
            </div>
            
            {/* Author name */}
            <div>
              <label htmlFor="name" className="inline-flex items-center text-sm font-medium text-gray-700 mb-1">
                <span className="bg-blue-50 p-1.5 rounded-md text-blue-600 mr-2">
                  <UserIcon className="h-4 w-4" />
                </span>
                Name
              </label>
              <input
                id="name"
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter author name"
                {...register('name', { required: 'Name is required' })}
              />
              {errors.name && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <InformationCircleIcon className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                  {errors.name.message}
                </p>
              )}
            </div>
            
            {/* Author email */}
            <div>
              <label htmlFor="email" className="inline-flex items-center text-sm font-medium text-gray-700 mb-1">
                <span className="bg-blue-50 p-1.5 rounded-md text-blue-600 mr-2">
                  <EnvelopeIcon className="h-4 w-4" />
                </span>
                Email
              </label>
              <input
                id="email"
                type="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter author email"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address"
                  }
                })}
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <InformationCircleIcon className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                  {errors.email.message}
                </p>
              )}
            </div>
            
            {/* Author bio */}
            <div className="md:col-span-2">
              <label htmlFor="bio" className="inline-flex items-center text-sm font-medium text-gray-700 mb-1">
                <span className="bg-blue-50 p-1.5 rounded-md text-blue-600 mr-2">
                  <BookOpenIcon className="h-4 w-4" />
                </span>
                Bio
              </label>
              <textarea
                id="bio"
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter author biography, experience, and specializations..."
                {...register('bio')}
              ></textarea>
              <p className="mt-1 text-xs text-gray-500">
                A good bio helps readers connect with the author and understand their expertise
              </p>
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row sm:justify-end gap-3">
          <Link
            href="/authors"
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex justify-center items-center transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || uploadingImage}
            className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
          >
            <ArrowDownTrayIcon className="mr-2 h-4 w-4" />
            {isSubmitting || uploadingImage ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
} 