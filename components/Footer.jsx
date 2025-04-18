export default function Footer() {
  const year = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-gray-200 py-4 px-6">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="text-sm text-gray-500">
          &copy; {year} Chiller Transport. All rights reserved.
        </div>
        
        <div className="mt-3 md:mt-0 flex space-x-6">
          <a 
            href="#" 
            className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
          >
            Privacy Policy
          </a>
          <a 
            href="#" 
            className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
          >
            Terms of Service
          </a>
          <a 
            href="#" 
            className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
          >
            Contact
          </a>
        </div>
      </div>
      
      <div className="mt-2 text-xs text-center text-gray-400">
        Version 1.0.0 | Admin Dashboard
      </div>
    </footer>
  );
} 