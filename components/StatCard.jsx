import Link from 'next/link';
import { ArrowUpRightIcon } from '@heroicons/react/24/outline';

export default function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  linkHref, 
  linkText, 
  footer,
  iconBgColor = 'bg-blue-100',
  iconColor = 'text-blue-600' 
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h2 className="text-3xl font-bold text-gray-800 mt-2">{value}</h2>
        </div>
        <div className={`h-10 w-10 ${iconBgColor} rounded-lg flex items-center justify-center ${iconColor}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      
      <div className="mt-4">
        {linkHref && linkText ? (
          <Link 
            href={linkHref} 
            className="text-blue-600 hover:text-blue-800 flex items-center group text-sm"
          >
            {linkText}
            <ArrowUpRightIcon 
              className="h-3.5 w-3.5 ml-1 transform transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" 
            />
          </Link>
        ) : footer ? (
          <div className="text-gray-500 flex items-center text-sm">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
} 