'use client';

import { useState, useEffect } from 'react';
import { DocumentTextIcon, UsersIcon, CalendarIcon, CircleStackIcon } from '@heroicons/react/24/outline';
import StatCard from '@/components/StatCard';

export default function DashboardStats() {
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalAuthors: 0,
    postsThisMonth: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch data from API endpoint
        const response = await fetch('/api/dashboard/stats');
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || errorData.error || 'Failed to load dashboard data');
        }
        
        const statsData = await response.json();
        setStats(statsData);
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
        setError(err.message || "Failed to load dashboard data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-600 border-b-blue-200 border-l-blue-200 border-r-blue-200 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-6 rounded-md max-w-3xl mx-auto">
        <div className="flex">
          <div className="flex-shrink-0">
            <CircleStackIcon className="h-6 w-6 text-red-500" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-red-800">Data Not Available</h3>
            <div className="mt-2 text-red-700">
              <p>{error}</p>
              <p className="mt-2">The database might not be properly configured or connected.</p>
            </div>
            <div className="mt-4">
              <button 
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:border-blue-700 focus:shadow-outline-blue active:bg-blue-700 transition ease-in-out duration-150"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { totalPosts, totalAuthors, postsThisMonth } = stats;

  // Check if there's no data
  const noData = totalPosts === 0 && totalAuthors === 0 && postsThisMonth === 0;

  if (noData) {
    return (
      <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-6 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <CircleStackIcon className="h-6 w-6 text-blue-500" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-blue-800">No Data Found</h3>
            <div className="mt-2 text-blue-700">
              <p>There is no data to display.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard 
        title="Total Posts" 
        value={totalPosts} 
        icon={DocumentTextIcon} 
        bgColor="bg-blue-500" 
        textColor="text-white"
        linkHref="/posts"
        linkText="View all posts"
      />
      <StatCard 
        title="Total Authors" 
        value={totalAuthors} 
        icon={UsersIcon} 
        bgColor="bg-gray-700" 
        textColor="text-white"
        linkHref="/authors"
        linkText="Manage authors"
      />
      <StatCard 
        title="Posts This Month" 
        value={postsThisMonth} 
        icon={CalendarIcon} 
        bgColor="bg-blue-700" 
        textColor="text-white"
        linkHref="/posts"
        linkText="View recent posts"
      />
    </div>
  );
} 