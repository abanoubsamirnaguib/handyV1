<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Product;
use App\Models\ProductImage;
use App\Services\ImageService;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
use Illuminate\Support\Str;

class ConvertImagesToWebP extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'images:convert-to-webp {--dry-run : Run without making changes}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Convert all existing product/gig images to WebP format';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $dryRun = $this->option('dry-run');
        
        if ($dryRun) {
            $this->info('🔍 DRY RUN MODE - No changes will be made');
        }
        
        $this->info('🚀 Starting image conversion to WebP...');
        
        // Initialize Image Manager with GD driver
        $manager = new ImageManager(new Driver());
        
        // Get all product images
        $productImages = ProductImage::all();
        $totalImages = $productImages->count();
        
        if ($totalImages === 0) {
            $this->warn('No images found to convert.');
            return 0;
        }
        
        $this->info("Found {$totalImages} images to process.");
        
        $bar = $this->output->createProgressBar($totalImages);
        $bar->start();
        
        $converted = 0;
        $skipped = 0;
        $errors = 0;
        
        foreach ($productImages as $productImage) {
            try {
                $imagePath = $productImage->image_url;
                
                // Skip if already WebP
                if (str_ends_with(strtolower($imagePath), '.webp')) {
                    $skipped++;
                    $bar->advance();
                    continue;
                }
                
                // Extract relative path from URL if it's a full URL
                if (str_starts_with($imagePath, 'http://') || str_starts_with($imagePath, 'https://')) {
                    // Extract path after /storage/
                    if (preg_match('#/storage/(.+)$#', $imagePath, $matches)) {
                        $imagePath = $matches[1];
                    } else {
                        $this->newLine();
                        $this->warn("Could not extract path from URL: {$imagePath}");
                        $errors++;
                        $bar->advance();
                        continue;
                    }
                }
                
                // Get full path
                $fullPath = storage_path('app/public/' . $imagePath);
                
                // Check if file exists
                if (!file_exists($fullPath)) {
                    $this->newLine();
                    $this->warn("File not found: {$imagePath}");
                    $this->warn("Full path: {$fullPath}");
                    $errors++;
                    $bar->advance();
                    continue;
                }
                
                if (!$dryRun) {
                    // Get product directory
                    $product = $productImage->product;
                    $directory = 'products/' . $product->id;
                    
                    // Generate new WebP filename
                    $filename = Str::uuid() . '.webp';
                    $webpPath = $directory . '/' . $filename;
                    $webpFullPath = storage_path('app/public/' . $webpPath);
                    
                    // Get old file size
                    $oldSize = filesize($fullPath);
                    
                    // Load and convert image using Intervention Image
                    try {
                        $image = $manager->read($fullPath);
                        
                        // Resize if needed (max 1920px width)
                        if ($image->width() > 1920) {
                            $image->scale(width: 1920);
                        }
                        
                        // Encode to WebP with 100% quality and save
                        $encoded = $image->toWebp(quality: 100);
                        file_put_contents($webpFullPath, $encoded);
                        
                        // Get new file size
                        $newSize = filesize($webpFullPath);
                        $savings = $oldSize - $newSize;
                        $savingsPercent = round(($savings / $oldSize) * 100, 2);
                        
                        // Update database
                        $productImage->image_url = $webpPath;
                        $productImage->save();
                        
                        // Delete old image
                        unlink($fullPath);
                        
                        $converted++;
                        
                    } catch (\Exception $e) {
                        $this->newLine();
                        $this->error("Failed to convert {$imagePath}: " . $e->getMessage());
                        $errors++;
                        $bar->advance();
                        continue;
                    }
                    
                } else {
                    // Dry run - just count
                    $converted++;
                }
                
            } catch (\Exception $e) {
                $this->newLine();
                $this->error("Error processing {$imagePath}: " . $e->getMessage());
                $errors++;
            }
            
            $bar->advance();
        }
        
        $bar->finish();
        $this->newLine(2);
        
        // Summary
        $this->info('✅ Conversion complete!');
        $this->table(
            ['Status', 'Count'],
            [
                ['Converted', $converted],
                ['Skipped (already WebP)', $skipped],
                ['Errors', $errors],
                ['Total', $totalImages],
            ]
        );
        
        if ($dryRun) {
            $this->warn('This was a DRY RUN. Run without --dry-run to actually convert images.');
        }
        
        return 0;
    }
}
