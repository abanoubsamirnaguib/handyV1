<?php
namespace App\Services;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class ImageService
{
    /**
     * Get an instance of the Image Manager
     * 
     * @return ImageManager
     */
    private static function getImageManager()
    {
        return new ImageManager(new Driver());
    }
    /**
     * Convert uploaded image to WebP format and save it using Intervention Image
     * 
     * @param \Illuminate\Http\UploadedFile $uploadedFile
     * @param string $directory The directory path to save the image (e.g., 'products/123')
     * @param int $quality WebP quality (0-100, default 80)
     * @param int|null $maxWidth Maximum width for resizing (optional)
     * @return string The path to the saved WebP image
     */
    public static function convertToWebP($uploadedFile, $directory, $quality = 100, $maxWidth = 1920)
    {
        try {
            // Generate unique filename with .webp extension
            $filename = Str::uuid() . '.webp';
            $fullPath = $directory . '/' . $filename;
            
            // Get the full storage path
            $storagePath = storage_path('app/public/' . $fullPath);
            
            // Ensure directory exists
            $directoryPath = storage_path('app/public/' . $directory);
            if (!file_exists($directoryPath)) {
                mkdir($directoryPath, 0755, true);
            }
            
            // Load image using Intervention Image v3
            $manager = self::getImageManager();
            $image = $manager->read($uploadedFile->getRealPath());
            
            // Get original size for logging
            $originalSize = filesize($uploadedFile->getRealPath());
            
            // Resize if image is larger than maxWidth while maintaining aspect ratio
            if ($maxWidth && $image->width() > $maxWidth) {
                $image->scale(width: $maxWidth);
            }
            
            // Encode to WebP format with specified quality and save
            $encoded = $image->toWebp(quality: $quality);
            file_put_contents($storagePath, $encoded);
            
            // Get new size for logging
            $newSize = filesize($storagePath);
            $savingsPercent = round((($originalSize - $newSize) / $originalSize) * 100, 1);
            
            // Log success
            \Log::info("Image converted to WebP", [
                'original_size' => number_format($originalSize / 1024, 2) . 'KB',
                'webp_size' => number_format($newSize / 1024, 2) . 'KB',
                'savings' => $savingsPercent . '%',
                'path' => $fullPath
            ]);
            
            return $fullPath;
            
        } catch (\Exception $e) {
            \Log::error("Failed to convert image to WebP", [
                'error' => $e->getMessage(),
                'file' => $uploadedFile->getClientOriginalName(),
                'directory' => $directory
            ]);
            throw new \Exception("Failed to convert image to WebP: " . $e->getMessage());
        }
    }
    
    /**
     * Convert and save multiple images to WebP format
     * 
     * @param array $uploadedFiles Array of uploaded files
     * @param string $directory The directory path to save images
     * @param int $quality WebP quality (0-100, default 80)
     * @param int|null $maxWidth Maximum width for resizing (optional)
     * @return array Array of paths to saved WebP images
     */
    public static function convertMultipleToWebP($uploadedFiles, $directory, $quality = 100, $maxWidth = 1920)
    {
        $paths = [];
        
        foreach ($uploadedFiles as $file) {
            $paths[] = self::convertToWebP($file, $directory, $quality, $maxWidth);
        }
        
        return $paths;
    }
    
    /**
     * Delete an image from storage
     * 
     * @param string $path The path to the image
     * @return bool
     */
    public static function deleteImage($path)
    {
        if ($path && Storage::disk('public')->exists($path)) {
            return Storage::disk('public')->delete($path);
        }
        
        return false;
    }
    
    /**
     * Delete multiple images from storage
     * 
     * @param array $paths Array of image paths
     * @return void
     */
    public static function deleteMultipleImages($paths)
    {
        foreach ($paths as $path) {
            self::deleteImage($path);
        }
    }
    
    /**
     * Delete a directory and all its contents
     * 
     * @param string $directory The directory path
     * @return bool
     */
    public static function deleteDirectory($directory)
    {
        if (Storage::disk('public')->exists($directory)) {
            return Storage::disk('public')->deleteDirectory($directory);
        }
        
        return false;
    }
    
    /**
     * Get file size information for an image
     * 
     * @param string $path The path to the image in storage
     * @return array|null Array with size info or null if file doesn't exist
     */
    public static function getImageInfo($path)
    {
        if (!Storage::disk('public')->exists($path)) {
            return null;
        }
        
        $fullPath = storage_path('app/public/' . $path);
        $size = filesize($fullPath);
        
        return [
            'path' => $path,
            'size_bytes' => $size,
            'size_kb' => round($size / 1024, 2),
            'size_mb' => round($size / (1024 * 1024), 2),
            'is_webp' => str_ends_with(strtolower($path), '.webp'),
            'exists' => true
        ];
    }
    
    /**
     * Validate if uploaded file is a valid image
     * 
     * @param \Illuminate\Http\UploadedFile $file
     * @return bool
     */
    public static function isValidImage($file)
    {
        if (!$file || !$file->isValid()) {
            return false;
        }
        
        $allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        return in_array($file->getMimeType(), $allowedMimes);
    }
}
