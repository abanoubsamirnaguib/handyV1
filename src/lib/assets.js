// Utility function to get proper asset URL
export const getAssetUrl = (path) => {
  if (!path) return null;
  
  // If it's already a full URL, return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // For production, use the backend domain
  if (window.location.hostname === 'handy3.abanoubsamir.com') {
    // Remove leading slash if present
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `https://handy3.abanoubsamir.com/backend/public/${cleanPath}`;
  }
  if (window.location.hostname === 'bazar.abanoubsamir.com') {
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `https://bazar.abanoubsamir.com/backend/public/${cleanPath}`;
  }
  
  // For development, use localhost
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  return `http://localhost:8000/${cleanPath}`;
};

// Component to handle image loading with fallback
export const SafeImage = ({ src, alt, className, fallback = '/placeholder-image.jpg', ...props }) => {
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
