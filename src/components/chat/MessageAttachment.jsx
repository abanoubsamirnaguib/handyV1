import React, { useState } from 'react';
import { File, Image, AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import ImageExample from '@/components/ui/image-example';

const MessageAttachment = ({ attachment, isOwn }) => {
  const [showFullImage, setShowFullImage] = useState(false);
  
  // Check if attachment is undefined or null
  if (!attachment) {
    return (
      <div className={cn(
        "border rounded-lg overflow-hidden mt-2 p-3",
        isOwn ? "border-primary/20" : "border-gray-200"
      )}>
        <div className="flex items-center text-orange-500">
          <AlertCircle className="h-4 w-4 mr-2" />
          <span>المرفق غير متوفر</span>
        </div>
      </div>
    );
  }

  const isImage = attachment.file_type?.startsWith('image/') || attachment.type?.startsWith('image/');
  
  // Get the base URL from environment variables
  const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
  
  // Function to ensure URL is properly formatted with base URL if needed
  const getFullUrl = (url) => {
    // Handle null or undefined URL
    if (!url) {
      console.warn('Attachment URL is undefined or null');
      return '';
    }
    
    // If the URL already starts with http/https or BASE_URL, return as is
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith(BASE_URL)) {
      return url;
    }
    
    // Otherwise, prepend the BASE_URL
    return `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  };
  
  // Support both file_url (from getMessages) and url (from sendMessage response)
  const attachmentUrl = attachment.file_url || attachment.url || '';
  const fullUrl = attachmentUrl ? getFullUrl(attachmentUrl) : '';
  
  const handleImageClick = (e) => {
    e.preventDefault();
    if (fullUrl) {
      // Instead of redirecting, show modal
      setShowFullImage(true);
    }
  };

  return (
    <>
      <div className={cn(
        "border rounded-lg overflow-hidden mt-2",
        isOwn ? "border-primary/20" : "border-gray-200"
      )}>
        {isImage ? (
          <div className="relative">
            <ImageExample 
              src={fullUrl} 
              alt="مرفق" 
              className="max-w-full h-auto cursor-pointer"
              onClick={handleImageClick}
              fallbackSrc="/placeholder-image.jpg"
            />
          </div>
        ) : (
          <div className="p-3 flex items-center">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <File className="h-4 w-4" />
              <span className="truncate max-w-[150px]">ملف مرفق</span>
            </div>
            {fullUrl && (
              <a 
                href={fullUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline mr-auto"
              >
                عرض
              </a>
            )}
          </div>
        )}
      </div>

      {/* Full Image Modal */}
      {showFullImage && fullUrl && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 pb-20 md:pb-4"
          onClick={() => setShowFullImage(false)}
        >
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <button 
              className="absolute -top-10 right-0 bg-white rounded-full p-2"
              onClick={() => setShowFullImage(false)}
            >
              <X className="h-6 w-6" />
            </button>
            <img 
              src={fullUrl} 
              alt="مرفق" 
              className="max-w-full max-h-[85vh] object-contain" 
            />
          </div>
        </div>
      )}
    </>
  );
};

export default MessageAttachment;