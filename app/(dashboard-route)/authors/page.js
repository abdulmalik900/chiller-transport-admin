'use client';

import Link from 'next/link';
import { UserPlusIcon } from '@heroicons/react/24/outline';
import AuthorsTable from '@/components/authors/AuthorsTable';

export default function Authors() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Author Management</h1>
          <p className="text-gray-500 mt-1">Manage your blog authors and their profiles</p>
        </div>
        <div>
          <Link
            href="/authors/create"
            className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-blue-700 transition-colors"
          >
            <UserPlusIcon className="h-4 w-4 mr-2" />
            Add Author
          </Link>
        </div>
      </div>
      
      <AuthorsTable />
    </div>
  );
} 