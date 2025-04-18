import { DocumentTextIcon, UsersIcon, CalendarIcon } from '@heroicons/react/24/outline';
import DashboardStats from '@/components/dashboard/DashboardStats';
import StatCard from '@/components/StatCard';

export default function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of your blog statistics</p>
      </div>
      
      <DashboardStats />
    </div>
  );
} 