import Link from 'next/link';
import { PlusIcon } from '@heroicons/react/24/outline';
import PostsTable from '@/components/posts/PostsTable';

export default function PostsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Posts</h1>
        <Link 
          href="/posts/create" 
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center transition-colors"
        >
          <PlusIcon className="h-4 w-4 mr-2" /> Create Post
        </Link>
      </div>

      <PostsTable />
    </div>
  );
}
