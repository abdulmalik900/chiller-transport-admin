import "./globals.css";
import 'react-quill-new/dist/quill.snow.css';
import Script from 'next/script';

export const metadata = {
  title: 'Chiller Admin - Blog Management',
  description: 'Admin dashboard for managing blog content',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 min-h-screen">
        {children}
        <Script id="ensure-toolbar-visibility" strategy="afterInteractive">
          {`
            function ensureQuillToolbarVisible() {
              const toolbars = document.querySelectorAll('.ql-toolbar.ql-snow');
              toolbars.forEach(toolbar => {
                if (toolbar) {
                  toolbar.style.display = 'flex';
                  toolbar.style.visibility = 'visible';
                  toolbar.style.opacity = '1';
                  toolbar.style.position = 'sticky';
                  toolbar.style.top = '0';
                  toolbar.style.zIndex = '100';
                  toolbar.style.backgroundColor = 'white';
                }
                
                const formats = toolbar.querySelectorAll('.ql-formats');
                formats.forEach(item => {
                  item.style.display = 'flex';
                  item.style.visibility = 'visible';
                  item.style.opacity = '1';
                });
              });
            }
            
            // Run on initial load
            document.addEventListener('DOMContentLoaded', ensureQuillToolbarVisible);
            
            // Run on paste events throughout the document
            document.addEventListener('paste', () => {
              ensureQuillToolbarVisible();
              // Run again after a small delay to catch any DOM updates
              setTimeout(ensureQuillToolbarVisible, 50);
              setTimeout(ensureQuillToolbarVisible, 200);
            });
            
            // Run on clipboard events
            document.addEventListener('copy', ensureQuillToolbarVisible);
            document.addEventListener('cut', ensureQuillToolbarVisible);
            
            // Set up MutationObserver to detect DOM changes
            const observer = new MutationObserver(() => {
              ensureQuillToolbarVisible();
            });
            
            // Start observing the document
            observer.observe(document.body, { 
              subtree: true, 
              childList: true,
              attributes: true,
              attributeFilter: ['style', 'class']
            });
          `}
        </Script>
      </body>
    </html>
  );
}
