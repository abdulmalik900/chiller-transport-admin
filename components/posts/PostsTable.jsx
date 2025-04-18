'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  MagnifyingGlassIcon, 
  PencilSquareIcon, 
  TrashIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  ExclamationTriangleIcon, 
  CircleStackIcon, 
  ArrowPathIcon 
} from '@heroicons/react/24/outline';
import TableCard from '@/components/TableCard';
import { getAllPosts, deletePost } from '@/app/services/apiService';

export default function PostsTable() {
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Track deletion state
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletePostId, setDeletePostId] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    async function fetchPosts() {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch posts from API
        const postsData = await getAllPosts();
        
        if (!postsData || !Array.isArray(postsData)) {
          throw new Error("Invalid data format received from the API");
        }
        
        setPosts(postsData);
      } catch (err) {
        console.error("Failed to fetch posts:", err);
        setError(err.message || "Failed to load posts. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchPosts();
  }, [refreshTrigger]);
  
  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };
  
  // Handle post deletion
  const handleDeletePost = async (postId) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    try {
      setIsDeleting(true);
      setDeletePostId(postId);
      
      // Call the API service to delete the post
      await deletePost(postId);
      
      // Remove the post from the state
      setPosts(posts.filter(post => post.id !== postId));
      
    } catch (err) {
      console.error('Error deleting post:', err);
      alert('Failed to delete post. Please try again.');
    } finally {
      setIsDeleting(false);
      setDeletePostId(null);
    }
  };

  // Filter posts based on search term
  const filteredPosts = posts.filter(post => 
    post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.author?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-600 border-b-blue-200 border-l-blue-200 border-r-blue-200 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading posts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-6 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <CircleStackIcon className="h-6 w-6 text-red-500" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-red-800">Error Loading Data</h3>
            <div className="mt-2 text-red-700">
              <p>{error}</p>
              <p className="mt-2">There was a problem connecting to the database or API.</p>
            </div>
            <div className="mt-4">
              <button 
                onClick={handleRefresh}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:border-blue-700 focus:shadow-outline-blue active:bg-blue-700 transition ease-in-out duration-150"
              >
                <ArrowPathIcon className="h-4 w-4 mr-2" /> Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Search and filters */}
      <div className="bg-white p-4 rounded-md shadow-sm">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-4.5 w-4.5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search posts by title, author or content..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Posts list */}
      <TableCard
        title="All Posts"
        bgColor="bg-blue-600"
        textColor="text-white"
      >
        <div className="overflow-x-auto">
          {filteredPosts.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        <Link href={`/posts/${post.slug}`} className="hover:text-blue-600 transition-colors">
                          {post.title}
                        </Link>
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-md">{post.excerpt}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{post.author?.name || 'Unknown'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {post.published ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            <CheckCircleIcon className="h-3.5 w-3.5 mr-1" /> Published
                          </span>
                        ) : post.scheduledFor ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            <ClockIcon className="h-3.5 w-3.5 mr-1" /> Scheduled
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            <ExclamationTriangleIcon className="h-3.5 w-3.5 mr-1" /> Draft
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link 
                          href={`/posts/${post.id}/edit`}
                          className="text-gray-600 hover:text-gray-900 p-1 rounded-full hover:bg-gray-50"
                          title="Edit"
                        >
                          <PencilSquareIcon className="h-4.5 w-4.5" />
                        </Link>
                        <button
                          className="text-red-600 hover:text-red-900 disabled:opacity-50 p-1 rounded-full hover:bg-red-50"
                          title="Delete"
                          onClick={() => handleDeletePost(post.id)}
                          disabled={isDeleting && deletePostId === post.id}
                        >
                          <TrashIcon className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-10">
              <div className="bg-gray-50 rounded-lg p-8 inline-block">
                <CircleStackIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">No Data Found</h3>
                {searchTerm ? (
                  <div>
                    <p className="text-gray-500 mb-3">No posts match your search criteria</p>
                    <button 
                      onClick={() => setSearchTerm('')}
                      className="text-blue-600 hover:text-blue-800 font-medium hover:underline focus:outline-none"
                    >
                      Clear search
                    </button>
                  </div>
                ) : (
                  <p className="text-gray-500">There are no posts available in the system</p>
                )}
              </div>
            </div>
          )}
        </div>
      </TableCard>
    </>
  );
} 