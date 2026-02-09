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
     * @param int|null $scale Scale percentage (1-100). If null, uses config value. 50 = scale to 50% of original
     * @param int|null $quality WebP quality (1-100). If null, uses config value
     * @param int|null $minQuality Minimum WebP quality when enforcing max size. If null, uses config value
     * @param int|null $qualityStep Quality step size when reducing quality. If null, uses config value
     * @param int|null $minSizeKb Minimum file size in KB to process. If null, uses config value
     * @param int|null $maxSizeKb Maximum file size in KB after resize. If null, uses config value
     * @return string The path to the saved WebP image
     */
    public static function convertToWebP(
        $uploadedFile,
        $directory,
        $scale = null,
        $quality = null,
        $minQuality = null,
        $qualityStep = null,
        $minSizeKb = null,
        $maxSizeKb = null
    ) {
        try {
            // Get config values or use provided parameters
            $scale = $scale ?? config('images.webp.scale', 50);
            $quality = $quality ?? config('images.webp.quality', 85);
            $minQuality = $minQuality ?? config('images.webp.min_quality', 40);
            $qualityStep = $qualityStep ?? config('images.webp.quality_step', 5);
            $minSizeKb = $minSizeKb ?? config('images.webp.min_size_kb', 0);
            $maxSizeKb = $maxSizeKb ?? config('images.webp.max_size_kb', 200);

            // Validate parameters
            if ($scale < 1 || $scale > 100) {
                throw new \Exception('Scale must be between 1 and 100.');
            }
            if ($quality < 1 || $quality > 100) {
                throw new \Exception('Quality must be between 1 and 100.');
            }
            if ($minQuality < 1 || $minQuality > 100) {
                throw new \Exception('Minimum quality must be between 1 and 100.');
            }
            if ($qualityStep < 1 || $qualityStep > 100) {
                throw new \Exception('Quality step must be between 1 and 100.');
            }

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
            
            // Get original size
            $originalSize = filesize($uploadedFile->getRealPath());
            
            // Check minimum size
            if ($minSizeKb > 0 && $originalSize < ($minSizeKb * 1024)) {
                \Log::info("Image skipped (below min size)", [
                    'original_size' => number_format($originalSize / 1024, 2) . 'KB',
                    'min_size_kb' => $minSizeKb,
                    'file' => $uploadedFile->getClientOriginalName()
                ]);
                // Still process the image, just log it
            }
            
            // Load image using Intervention Image v3
            $manager = self::getImageManager();
            $image = $manager->read($uploadedFile->getRealPath());
            
            // Scale image by percentage
            $targetWidth = (int) round($image->width() * ($scale / 100));
            $targetWidth = max(1, $targetWidth);
            $image->scale(width: $targetWidth);
            
            // Encode to WebP format with specified quality
            $currentQuality = $quality;
            $encoded = $image->toWebp(quality: $currentQuality);
            file_put_contents($storagePath, $encoded);
            
            // Enforce max size by reducing quality if needed
            if ($maxSizeKb > 0) {
                clearstatcache(true, $storagePath);
                $currentSize = filesize($storagePath);
                
                if ($currentSize !== false) {
                    while ($currentSize > ($maxSizeKb * 1024) && $currentQuality > $minQuality) {
                        $currentQuality = max($minQuality, $currentQuality - $qualityStep);
                        $encoded = $image->toWebp(quality: $currentQuality);
                        file_put_contents($storagePath, $encoded);
                        clearstatcache(true, $storagePath);
                        $currentSize = filesize($storagePath);
                        if ($currentSize === false) {
                            break;
                        }
                    }
                }
            }
            
            // Get final size for logging
            clearstatcache(true, $storagePath);
            $newSize = filesize($storagePath);
            $savingsPercent = round((($originalSize - $newSize) / $originalSize) * 100, 1);
            
            // Log success
            \Log::info("Image converted to WebP", [
                'original_size' => number_format($originalSize / 1024, 2) . 'KB',
                'webp_size' => number_format($newSize / 1024, 2) . 'KB',
                'savings' => $savingsPercent . '%',
                'scale' => $scale . '%',
                'final_quality' => $currentQuality,
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
     * @param int|null $scale Scale percentage (1-100). If null, uses config value
     * @param int|null $quality WebP quality (1-100). If null, uses config value
     * @param int|null $minQuality Minimum WebP quality when enforcing max size. If null, uses config value
     * @param int|null $qualityStep Quality step size when reducing quality. If null, uses config value
     * @param int|null $minSizeKb Minimum file size in KB to process. If null, uses config value
     * @param int|null $maxSizeKb Maximum file size in KB after resize. If null, uses config value
     * @return array Array of paths to saved WebP images
     */
    public static function convertMultipleToWebP(
        $uploadedFiles,
        $directory,
        $scale = null,
        $quality = null,
        $minQuality = null,
        $qualityStep = null,
        $minSizeKb = null,
        $maxSizeKb = null
    ) {
        $paths = [];
        
        foreach ($uploadedFiles as $file) {
            $paths[] = self::convertToWebP(
                $file,
                $directory,
                $scale,
                $quality,
                $minQuality,
                $qualityStep,
                $minSizeKb,
                $maxSizeKb
            );
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
