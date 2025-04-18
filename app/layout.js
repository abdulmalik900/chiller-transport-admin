import "./globals.css";

export const metadata = {
  title: 'Chiller Admin - Blog Management',
  description: 'Admin dashboard for managing blog content',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
