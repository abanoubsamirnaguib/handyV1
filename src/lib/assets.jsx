import { useEffect, useState } from 'react';

export const getApiBaseUrl = () => {
  // Prefer Vite env if present, fallback to localhost
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
};

/**
 * Normalizes a storage image path to a full URL.
 *
 * Supports:
 * - Full URLs: "https://.../storage/x.jpg" (returned as-is)
 * - Absolute storage paths: "/storage/x.jpg"
 * - Relative storage paths: "storage/x.jpg"
 * - Raw storage keys: "products/x.jpg" -> baseUrl + "/storage/products/x.jpg"
 */
export const getStorageUrl = (path, { baseUrl = getApiBaseUrl() } = {}) => {
  if (!path) return null;

  // If it's already a full URL, return as is
  if (typeof path === 'string' && (path.startsWith('http://') || path.startsWith('https://'))) {
    return path;
  }

  const cleanPath = String(path).replace(/^\/+/, ''); // remove leading slashes

  // If caller already provided "storage/..", keep it
  if (cleanPath.startsWith('storage/')) {
    return `${baseUrl}/${cleanPath}`;
  }

  // Default: treat as a public disk key
  return `${baseUrl}/storage/${cleanPath}`;
};

// Backward-compatible helper (generic assets, not only storage)
export const getAssetUrl = (path, { baseUrl = getApiBaseUrl() } = {}) => {
  if (!path) return null;

  // If it's already a full URL, return as is
  if (typeof path === 'string' && (path.startsWith('http://') || path.startsWith('https://'))) {
    return path;
  }

  const cleanPath = String(path).replace(/^\/+/, '');

  // If it's a storage path/key, normalize through getStorageUrl
  if (cleanPath.startsWith('storage/') || cleanPath.startsWith('backend/public/storage/')) {
    return getStorageUrl(cleanPath.replace(/^backend\/public\//, ''), { baseUrl });
  }

  // Otherwise assume it's a public path under backend root
  return `${baseUrl}/${cleanPath}`;
};

// Component to handle image loading with fallback
export const SafeImage = ({
  src,
  alt,
  className,
  fallback = '/placeholder-image.jpg',
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState(getAssetUrl(src));
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(getAssetUrl(src));
    setHasError(false);
  }, [src]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(getAssetUrl(fallback));
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
      {...props}
    />
  );
};

