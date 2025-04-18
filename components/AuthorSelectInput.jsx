'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDownIcon, UserIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';

export default function AuthorSelectInput({ 
  authors = [], 
  selectedAuthorId = '', 
  onChange, 
  error,
  placeholder = "Select an author"
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const dropdownRef = useRef(null);
  
  // Find selected author on load or when selectedAuthorId changes
  useEffect(() => {
    if (selectedAuthorId) {
      const author = authors.find(a => a.id === selectedAuthorId);
      setSelectedAuthor(author || null);
    } else {
      setSelectedAuthor(null);
    }
  }, [selectedAuthorId, authors]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleAuthorSelect = (author) => {
    setSelectedAuthor(author);
    setIsOpen(false);
    onChange(author.id);
  };
  
  const clearSelection = (e) => {
    e.stopPropagation();
    setSelectedAuthor(null);
    onChange('');
  };
  
  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        className={`flex items-center justify-between w-full px-3 py-2.5 bg-white border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg cursor-pointer`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedAuthor ? (
          <div className="flex items-center flex-1">
            <div className="flex-shrink-0 h-6 w-6 mr-2">
              {selectedAuthor.avatarUrl ? (
                <img 
                  src={selectedAuthor.avatarUrl} 
                  alt={selectedAuthor.name}
                  className="h-6 w-6 rounded-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedAuthor.name)}&background=random`;
                  }}
                />
              ) : (
                <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-semibold">
                  {selectedAuthor.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <span className="text-gray-700 truncate">{selectedAuthor.name}</span>
            {selectedAuthor && (
              <button 
                type="button" 
                className="ml-2 text-gray-400 hover:text-gray-600"
                onClick={clearSelection}
              >
                <XMarkIcon className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center text-gray-500">
            <UserIcon className="h-4 w-4 mr-2" />
            <span>{placeholder}</span>
          </div>
        )}
        <ChevronDownIcon className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
      </div>
      
      {isOpen && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {authors.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500">No authors available</div>
          ) : (
            <ul>
              {authors.map(author => (
                <li 
                  key={author.id} 
                  className={`px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center ${selectedAuthor?.id === author.id ? 'bg-blue-50' : ''}`}
                  onClick={() => handleAuthorSelect(author)}
                >
                  <div className="flex-shrink-0 h-8 w-8 mr-3">
                    {author.avatarUrl ? (
                      <img 
                        src={author.avatarUrl} 
                        alt={author.name}
                        className="h-8 w-8 rounded-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(author.name)}&background=random`;
                        }}
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-semibold">
                        {author.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{author.name}</div>
                    <div className="text-xs text-gray-500 truncate">{author.email}</div>
                  </div>
                  {selectedAuthor?.id === author.id && (
                    <CheckIcon className="h-4 w-4 text-blue-600 ml-2" />
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center">
          <span className="mr-1">•</span> {error}
        </p>
      )}
    </div>
  );
} 