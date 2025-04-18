import Link from 'next/link';
import { ArrowUpRightIcon } from '@heroicons/react/24/outline';

export default function TableCard({ 
  title, 
  linkHref, 
  linkText,
  children,
  bgColor = 'bg-blue-600',
  textColor = 'text-white',
  actionButtons
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <div className={`flex justify-between items-center ${bgColor} px-6 py-4`}>
        <h2 className={`text-lg font-semibold ${textColor}`}>{title}</h2>
        <div className="flex space-x-4">
          {actionButtons}
          
          {linkHref && linkText && (
            <Link 
              href={linkHref} 
              className={`text-sm ${textColor} hover:text-opacity-80 flex items-center group`}
            >
              {linkText} <ArrowUpRightIcon className="h-3.5 w-3.5 ml-1 transform transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          )}
        </div>
      </div>
      
      {children}
    </div>
  );
} 