import React from 'react';
import { File, Download, Image, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import ImageExample from '@/components/ui/image-example';

const MessageAttachment = ({ attachment, isOwn }) => {
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
  
  return (
    <div className={cn(
      "border rounded-lg overflow-hidden mt-2",
      isOwn ? "border-primary/20" : "border-gray-200"
    )}>
      {isImage ? (
        <ImageExample 
          src={fullUrl} 
          alt="مرفق" 
          className="max-w-full h-auto cursor-pointer"
          onClick={() => fullUrl && window.open(fullUrl, '_blank')}
          fallbackSrc="/placeholder-image.jpg"
        />
      ) : (
        <div className="p-3 flex items-center justify-between">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <File className="h-4 w-4" />
            <span className="truncate max-w-[150px]">ملف مرفق</span>
          </div>
          {fullUrl ? (
            <a 
              href={fullUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
              download
            >
              <Download className="h-4 w-4" />
            </a>
          ) : (
            <span className="text-gray-400">
              <Download className="h-4 w-4" />
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default MessageAttachment; 