import { Inter } from "next/font/google";
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const inter = Inter({
  subsets: ["latin"],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
});

/**
 * Shared layout for all dashboard routes (dashboard, posts, authors, settings)
 * This route group pattern keeps all admin pages under a shared layout
 */
export default function DashboardLayout({ children }) {
  return (
    <ProtectedRoute>
      <div className={`${inter.variable} font-sans bg-gray-100`}>
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar */}
          <Sidebar />
          
          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-auto">
              {children}
            </main>
            <Footer />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 