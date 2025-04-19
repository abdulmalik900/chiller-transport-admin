'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';

// Import React Quill dynamically to avoid SSR issues
const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import('react-quill-new');
    return RQ;
  },
  { ssr: false }
);

// Import Quill CSS
import 'react-quill-new/dist/quill.snow.css';

export default function RichTextEditor({ value, onChange, modules, className, placeholder }) {
  const editorRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [editorHeight, setEditorHeight] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  
  // Make toolbar permanently visible to prevent hiding
  const ensureToolbarVisible = useCallback(() => {
    const toolbar = document.querySelector('.ql-toolbar');
    if (toolbar) {
      toolbar.style.display = 'flex';
      toolbar.style.visibility = 'visible';
      toolbar.style.opacity = '1';
      toolbar.style.position = 'sticky';
      toolbar.style.top = '0';
      toolbar.style.zIndex = '100';
      toolbar.style.backgroundColor = 'white';
      toolbar.style.flexWrap = 'wrap';
      toolbar.style.transition = 'none';
      
      // Ensure toolbar items are visible
      const toolbarItems = toolbar.querySelectorAll('.ql-formats');
      toolbarItems.forEach(item => {
        item.style.display = 'flex';
        item.style.visibility = 'visible';
        item.style.opacity = '1';
      });
    }
  }, []);
  
  // Image paste handler - converts pasted images to base64 and inserts them into the editor
  const handleImagePaste = useCallback((e) => {
    if (!editorRef.current) return;
    
    const editor = editorRef.current.getEditor();
    if (!editor) return;
    
    const clipboardData = e.clipboardData || window.clipboardData;
    if (!clipboardData) return;
    
    // Check if clipboardData has images
    const items = clipboardData.items;
    let imageFound = false;
    
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          imageFound = true;
          e.preventDefault();
          e.stopPropagation();
          
          // Get image from clipboard
          const blob = items[i].getAsFile();
          if (!blob) continue;
          
          // Convert blob to base64
          const reader = new FileReader();
          reader.onload = (event) => {
            const base64Image = event.target.result;
            
            // Insert image at cursor position
            const range = editor.getSelection(true);
            if (range) {
              editor.insertEmbed(range.index, 'image', base64Image);
              editor.setSelection(range.index + 1, 0);
              
              // Ensure toolbar visibility after image insertion
              setTimeout(ensureToolbarVisible, 50);
              
              // Notify of content change
              onChange(editor.root.innerHTML);
            }
          };
          reader.readAsDataURL(blob);
          break;
        }
      }
    }
    
    // If no image was found, proceed with normal paste handling
    return !imageFound;
  }, [ensureToolbarVisible, onChange]);
  
  // Custom paste handler to prevent flickering and menu hiding
  const handlePasteEvent = useCallback((e) => {
    if (!editorRef.current) return;
    
    // Check for image paste first
    if (handleImagePaste(e)) {
      // If no image was pasted, continue with text paste
      // Get the editor and its contents
      const editor = editorRef.current.getEditor();
      if (!editor) return;
      
      // Capture current selection
      const range = editor.getSelection();
      if (!range) return;
      
      // Get clipboard data
      let clipboardData = e.clipboardData || window.clipboardData;
      if (!clipboardData) return;
      
      // Get text content
      const text = clipboardData.getData('text/html') || clipboardData.getData('text');
      if (!text) return;
      
      // Prevent the default paste behavior
      e.preventDefault();
      e.stopPropagation();
      
      // First, ensure toolbar is visible before pasting
      ensureToolbarVisible();
      
      // Insert the text at the current cursor position
      editor.clipboard.dangerouslyPasteHTML(range.index, text);
      
      // Update cursor position
      editor.setSelection(range.index + text.length, 0);
      
      // Ensure toolbar remains visible after paste
      setTimeout(ensureToolbarVisible, 10);
      setTimeout(ensureToolbarVisible, 100);
      
      // Prevent flickering by maintaining editor height
      if (editorHeight > 0) {
        const editorElement = editor.root.parentElement;
        if (editorElement) {
          editorElement.style.minHeight = `${editorHeight}px`;
        }
      }
    }
  }, [ensureToolbarVisible, editorHeight, handleImagePaste]);
  
  // Add event handlers to ensure toolbar visibility
  useEffect(() => {
    if (!editorRef.current || !isReady) return;
    
    const editor = editorRef.current.getEditor();
    if (!editor) return;
    
    // Store editor height to prevent flickering during paste
    if (editor.root && editor.root.parentElement) {
      setEditorHeight(editor.root.parentElement.offsetHeight);
    }
    
    // Create event handlers
    const handleFocus = () => {
      ensureToolbarVisible();
      setIsFocused(true);
    };
    
    const handleBlur = () => {
      setIsFocused(false);
      // Keep toolbar visible even on blur
      ensureToolbarVisible();
    };
    
    const handleChange = () => ensureToolbarVisible();
    const handleSelectionChange = () => ensureToolbarVisible();
    
    // Keyboard shortcut handler for common operations
    const handleKeyDown = (e) => {
      // Keep toolbar visible on keyboard shortcuts
      ensureToolbarVisible();
      
      // Optional: Add custom keyboard shortcuts
      // For example: Ctrl+S (or Cmd+S on Mac) to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        // Prevent browser save dialog
        e.preventDefault();
        // You could trigger a form submission here if needed
      }
    };
    
    // Call immediately to ensure initial visibility
    ensureToolbarVisible();
    
    // Wait a moment for the editor to fully initialize before ensuring visibility again
    const timeoutId = setTimeout(() => {
      ensureToolbarVisible();
    }, 500);
    
    // Add all event listeners
    editor.root.addEventListener('paste', handlePasteEvent, { capture: true });
    editor.root.addEventListener('focus', handleFocus);
    editor.root.addEventListener('blur', handleBlur);
    editor.root.addEventListener('keydown', handleKeyDown);
    editor.on('text-change', handleChange);
    editor.on('selection-change', handleSelectionChange);
    
    // Set up MutationObserver to detect DOM changes that might hide the toolbar
    const observer = new MutationObserver((mutations) => {
      ensureToolbarVisible();
    });
    
    const toolbarElement = document.querySelector('.ql-toolbar');
    if (toolbarElement) {
      observer.observe(toolbarElement, { 
        attributes: true,
        attributeFilter: ['style', 'class'],
        childList: true,
        subtree: true
      });
    }
    
    // Cleanup
    return () => {
      clearTimeout(timeoutId);
      if (editor && editor.root) {
        editor.root.removeEventListener('paste', handlePasteEvent, { capture: true });
        editor.root.removeEventListener('focus', handleFocus);
        editor.root.removeEventListener('blur', handleBlur);
        editor.root.removeEventListener('keydown', handleKeyDown);
      }
      if (editor) {
        editor.off('text-change', handleChange);
        editor.off('selection-change', handleSelectionChange);
      }
      observer.disconnect();
    };
  }, [editorRef.current, isReady, ensureToolbarVisible, handlePasteEvent]);
  
  // Track when component is ready
  useEffect(() => {
    const readyTimer = setTimeout(() => {
      setIsReady(true);
      ensureToolbarVisible();
    }, 200);
    
    return () => clearTimeout(readyTimer);
  }, [ensureToolbarVisible]);
  
  // Handle window resize to ensure toolbar remains visible
  useEffect(() => {
    const handleResize = () => {
      ensureToolbarVisible();
      
      // Update editor height on resize
      if (editorRef.current) {
        const editor = editorRef.current.getEditor();
        if (editor && editor.root && editor.root.parentElement) {
          setEditorHeight(editor.root.parentElement.offsetHeight);
        }
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [ensureToolbarVisible]);
  
  // Custom onChange handler to ensure toolbar visibility is maintained
  const handleEditorChange = (content) => {
    onChange(content);
    ensureToolbarVisible();
  };
  
  // Augment the standard modules with enhanced configurations
  const enhancedModules = {
    ...modules,
    clipboard: {
      ...(modules?.clipboard || {}),
      matchVisual: false, // Improves paste behavior
    },
    keyboard: {
      ...(modules?.keyboard || {}),
      bindings: {
        ...(modules?.keyboard?.bindings || {}),
        // Add custom key bindings if needed
      }
    },
    toolbar: modules?.toolbar || {
      container: toolbarOptions,
      handlers: {
        // Add custom handlers if needed
      }
    }
  };
  
  // Default toolbar options if none provided
  const toolbarOptions = [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    [{ 'align': [] }],
    ['link', 'image', 'blockquote', 'code-block'],
    [{ 'color': [] }, { 'background': [] }],
    ['clean']
  ];
  
  return (
    <div className={`rich-text-editor-wrapper ${isFocused ? 'focused' : ''}`}>
      <ReactQuill
        ref={editorRef}
        theme="snow"
        value={value}
        onChange={handleEditorChange}
        modules={enhancedModules}
        className={`${className} react-quill-editor`}
        placeholder={placeholder}
        preserveWhitespace={true}
        onPaste={(e) => {
          // Additional onPaste handler at the component level
          handlePasteEvent(e);
        }}
      />
      <style jsx global>{`
        /* Additional inline styles to ensure toolbar visibility */
        .ql-toolbar.ql-snow {
          display: flex !important;
          visibility: visible !important;
          opacity: 1 !important;
        }
        
        /* Focused editor styles */
        .rich-text-editor-wrapper.focused .ql-toolbar.ql-snow {
          border-color: #3b82f6 !important;
        }
        
        .rich-text-editor-wrapper.focused .ql-container.ql-snow {
          border-color: #3b82f6 !important;
        }
      `}</style>
    </div>
  );
} 