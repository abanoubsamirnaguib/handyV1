import React from 'react';
import { cn } from '@/lib/utils';

const ImageExample = ({ 
  src, 
  alt = "Image", 
  className, 
  width, 
  height, 
  objectFit = "cover", 
  onClick,
  fallbackSrc = "/placeholder-image.jpg",
  ...props 
}) => {
  // Handle undefined or null src
  const imgSrc = src || fallbackSrc;
  
  // Function to handle image loading errors
  const handleError = (e) => {
    if (e.target.src !== fallbackSrc) {
      e.target.src = fallbackSrc;
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={cn(
        "rounded-md", 
        className
      )}
      style={{ 
        width: width, 
        height: height, 
        objectFit 
      }}
      onClick={onClick}
      onError={handleError}
      {...props}
    />
  );
};

export default ImageExample; 