'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  MagnifyingGlassIcon, 
  PencilSquareIcon, 
  TrashIcon, 
  ArrowUpTrayIcon, 
  XMarkIcon,
  UserIcon,
  EnvelopeIcon,
  BookOpenIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { 
  getAllAuthors, 
  deleteAuthors, 
  createAuthor, 
  uploadImage,
  deleteAuthor
} from '@/app/services/apiService';
import TableCard from '@/components/TableCard';

export default function AuthorsTable() {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAuthors, setSelectedAuthors] = useState([]);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [addAuthorModalOpen, setAddAuthorModalOpen] = useState(false);
  
  // New author form state
  const [newAuthor, setNewAuthor] = useState({
    name: '',
    email: '',
    bio: '',
    avatarUrl: ''
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  
  // Track deletion state
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteAuthorId, setDeleteAuthorId] = useState(null);
  
  // Fetch authors from API
  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        setLoading(true);
        const authorsData = await getAllAuthors();
        console.log('Authors data loaded:', authorsData.map(a => ({
          id: a.id,
          name: a.name,
          avatarUrl: a.avatarUrl
        })));
        setAuthors(authorsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching authors:', err);
        setError('Failed to load authors. Please try refreshing the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchAuthors();
  }, []);
  
  // Handle sort change
  const handleSort = (field) => {
    if (field === sortField) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Handle author selection for batch actions
  const toggleSelectAuthor = (authorId) => {
    if (selectedAuthors.includes(authorId)) {
      setSelectedAuthors(selectedAuthors.filter(id => id !== authorId));
    } else {
      setSelectedAuthors([...selectedAuthors, authorId]);
    }
  };
  
  // Select/deselect all authors
  const toggleSelectAll = () => {
    if (selectedAuthors.length === filteredAuthors.length) {
      setSelectedAuthors([]);
    } else {
      setSelectedAuthors(filteredAuthors.map(author => author.id));
    }
  };
  
  // Filter authors by search term
  const filteredAuthors = authors.filter(author => 
    author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    author.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    author.bio?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Sort authors
  const sortedAuthors = [...filteredAuthors].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    // Special handling for posts count
    if (sortField === 'posts') {
      aValue = a.posts?.length || 0;
      bValue = b.posts?.length || 0;
    }
    
    // Compare values
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
  
  // Handle batch delete
  const handleBatchDelete = async () => {
    if (selectedAuthors.length === 0) return;
    
    try {
      await deleteAuthors(selectedAuthors);
      setAuthors(authors.filter(author => !selectedAuthors.includes(author.id)));
      setSelectedAuthors([]);
      setDeleteModalOpen(false);
    } catch (err) {
      console.error('Error deleting authors:', err);
      alert('Failed to delete authors. Some authors may have associated posts.');
    }
  };
  
  // Handle new author image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Create a preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
    
    try {
      // Upload to Cloudinary via API
      const uploadResponse = await uploadImage(file);
      setNewAuthor({ ...newAuthor, avatarUrl: uploadResponse.url });
    } catch (err) {
      console.error('Error uploading image:', err);
      alert('Failed to upload image. Please try again.');
    }
  };
  
  // Handle create new author
  const handleCreateAuthor = async (e) => {
    e.preventDefault();
    
    if (!newAuthor.name || !newAuthor.email) {
      alert('Name and email are required fields');
      return;
    }
    
    try {
      setSubmitting(true);
      const createdAuthor = await createAuthor(newAuthor);
      setAuthors([...authors, createdAuthor]);
      setAddAuthorModalOpen(false);
      
      // Reset form
      setNewAuthor({
        name: '',
        email: '',
        bio: '',
        avatarUrl: ''
      });
      setImagePreview(null);
    } catch (err) {
      console.error('Error creating author:', err);
      alert('Failed to create author. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handle author deletion
  const handleDeleteAuthor = async (authorId) => {
    if (!confirm('Are you sure you want to delete this author?')) return;
    
    try {
      setIsDeleting(true);
      setDeleteAuthorId(authorId);
      
      // Call the API service to delete the author
      await deleteAuthor(authorId);
      
      // Remove the author from the state
      setAuthors(authors.filter(author => author.id !== authorId));
      
    } catch (err) {
      console.error('Error deleting author:', err);
      alert('Failed to delete author. Please try again.');
    } finally {
      setIsDeleting(false);
      setDeleteAuthorId(null);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-600 border-b-blue-200 border-l-blue-200 border-r-blue-200 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading authors...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center bg-red-50 p-8 rounded-lg max-w-md">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-grow max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search authors by name, email or bio..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            {selectedAuthors.length > 0 && (
              <button
                onClick={() => setDeleteModalOpen(true)}
                className="flex items-center px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                <TrashIcon className="mr-1 h-5 w-5" />
                Delete {selectedAuthors.length} {selectedAuthors.length === 1 ? 'Author' : 'Authors'}
              </button>
            )}
          </div>
        </div>
        
        {/* Authors Table */}
        <div className="overflow-x-auto">
          <TableCard
            title="All Authors"
            bgColor="bg-gray-700"
            textColor="text-white"
          >
            <div className="overflow-x-auto">
              {filteredAuthors.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posts</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAuthors.map((author) => (
                      <tr key={author.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {author.avatarUrl ? (
                                <img
                                  src={author.avatarUrl}
                                  alt={author.name}
                                  className="h-10 w-10 rounded-full object-cover border border-gray-200"
                                  title={`Avatar URL: ${author.avatarUrl}`}
                                  onError={(e) => {
                                    // Fallback if image fails to load
                                    e.target.onerror = null;
                                    console.log('Avatar failed to load:', author.avatarUrl);
                                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(author.name)}&background=random`;
                                  }}
                                />
                              ) : (
                                <div 
                                  className="h-10 w-10 rounded-full bg-blue-100 inline-flex items-center justify-center text-blue-600 font-semibold"
                                  title="No avatar URL available"
                                >
                                  {author.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{author.name}</div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">{author.bio}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{author.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{author.postCount || 0}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{new Date(author.createdAt).toLocaleDateString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Link 
                              href={`/authors/${author.id}/edit`}
                              className="text-gray-600 hover:text-gray-900 p-1 rounded-full hover:bg-gray-50"
                              title="Edit"
                            >
                              <PencilSquareIcon className="h-4 w-4" />
                            </Link>
                            <button
                              className="text-red-600 hover:text-red-900 disabled:opacity-50 p-1 rounded-full hover:bg-red-50"
                              title="Delete"
                              onClick={() => handleDeleteAuthor(author.id)}
                              disabled={isDeleting && deleteAuthorId === author.id || author.postCount > 0}
                            >
                              <TrashIcon className="h-4 w-4" />
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
                    <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-800 mb-2">No Data Found</h3>
                    {searchTerm ? (
                      <div>
                        <p className="text-gray-500 mb-3">No authors match your search criteria</p>
                        <button 
                          onClick={() => setSearchTerm('')}
                          className="text-blue-600 hover:text-blue-800 font-medium hover:underline focus:outline-none"
                        >
                          Clear search
                        </button>
                      </div>
                    ) : (
                      <p className="text-gray-500">There are no authors available in the system</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </TableCard>
        </div>
      </div>
    
      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setDeleteModalOpen(false)}
            ></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto inline-flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <TrashIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Delete {selectedAuthors.length} {selectedAuthors.length === 1 ? 'Author' : 'Authors'}
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete {selectedAuthors.length === 1 ? 'this author' : 'these authors'}? This action cannot be undone.
                      </p>
                      {selectedAuthors.length === 1 && (
                        <p className="text-sm text-red-500 mt-2">
                          Note: Authors with existing posts cannot be deleted.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleBatchDelete}
                >
                  Delete
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setDeleteModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    
      {/* Add Author modal */}
      {addAuthorModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Add New Author</h3>
              <button
                className="text-gray-400 hover:text-gray-500"
                onClick={() => setAddAuthorModalOpen(false)}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateAuthor} className="p-6">
              <div className="mb-4 flex flex-col items-center">
                <div className="relative h-24 w-24 rounded-full bg-gray-100 mb-2 flex items-center justify-center overflow-hidden">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Author avatar preview" className="h-full w-full object-cover" />
                  ) : (
                    <UserIcon className="h-12 w-12 text-gray-400" />
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <ArrowUpTrayIcon className="h-4 w-4 mr-1" /> Upload Image
                </button>
              </div>
              
              <div className="space-y-4">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={newAuthor.name}
                    onChange={(e) => setNewAuthor({...newAuthor, name: e.target.value})}
                    required
                  />
                </div>
                
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={newAuthor.email}
                    onChange={(e) => setNewAuthor({...newAuthor, email: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="bio" className="inline-flex items-center text-sm font-medium text-gray-700 mb-1">
                    <span className="bg-blue-50 p-1.5 rounded-md text-blue-600 mr-2">
                      <BookOpenIcon className="h-4 w-4" />
                    </span>
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={3}
                    value={newAuthor.bio}
                    onChange={(e) => setNewAuthor({...newAuthor, bio: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setAddAuthorModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 flex items-center"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : (
                    <>
                      <PlusIcon className="h-4 w-4 mr-1" /> Add Author
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
} 