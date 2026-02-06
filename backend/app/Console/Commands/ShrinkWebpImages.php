<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\ProductImage;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class ShrinkWebpImages extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'images:shrink-webp
                            {--dry-run : Run without making changes}
                            {--scale=50 : Percent to scale resolution (1-100)}
                            {--quality=85 : WebP quality (1-100)}
                            {--min-quality=40 : Minimum WebP quality when enforcing max size}
                            {--quality-step=5 : Quality step size when enforcing max size}
                            {--min-size=0 : Minimum file size in KB to process}
                            {--max-size=200 : Max file size in KB after resize (0 to disable)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Shrink existing WebP product images by resolution percentage';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $dryRun = $this->option('dry-run');
        $scale = (int) $this->option('scale');
        $quality = (int) $this->option('quality');
        $minSizeKb = (int) $this->option('min-size');
        $maxSizeKb = (int) $this->option('max-size');
        $minQuality = (int) $this->option('min-quality');
        $qualityStep = (int) $this->option('quality-step');

        if ($scale < 1 || $scale > 100) {
            $this->error('Scale must be between 1 and 100.');
            return 1;
        }

        if ($quality < 1 || $quality > 100) {
            $this->error('Quality must be between 1 and 100.');
            return 1;
        }

        if ($minSizeKb < 0) {
            $this->error('Minimum size must be 0 or greater.');
            return 1;
        }

        if ($maxSizeKb < 0) {
            $this->error('Max size must be 0 or greater.');
            return 1;
        }

        if ($minQuality < 1 || $minQuality > 100) {
            $this->error('Minimum quality must be between 1 and 100.');
            return 1;
        }

        if ($qualityStep < 1 || $qualityStep > 100) {
            $this->error('Quality step must be between 1 and 100.');
            return 1;
        }

        if ($dryRun) {
            $this->info('🔍 DRY RUN MODE - No changes will be made');
        }

        $this->info('🚀 Starting WebP resize process...');

        $manager = new ImageManager(new Driver());

        $productImages = ProductImage::all();
        $totalImages = $productImages->count();

        if ($totalImages === 0) {
            $this->warn('No images found to process.');
            return 0;
        }

        $this->info("Found {$totalImages} images to scan.");

        $bar = $this->output->createProgressBar($totalImages);
        $bar->start();

        $resized = 0;
        $skippedNonWebp = 0;
        $skippedSmall = 0;
        $aboveMaxSize = 0;
        $errors = 0;

        foreach ($productImages as $productImage) {
            try {
                $imagePath = $productImage->image_url;

                if (!str_ends_with(strtolower($imagePath), '.webp')) {
                    $skippedNonWebp++;
                    $bar->advance();
                    continue;
                }

                if (str_starts_with($imagePath, 'http://') || str_starts_with($imagePath, 'https://')) {
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

                $fullPath = storage_path('app/public/' . $imagePath);

                if (!file_exists($fullPath)) {
                    $this->newLine();
                    $this->warn("File not found: {$imagePath}");
                    $this->warn("Full path: {$fullPath}");
                    $errors++;
                    $bar->advance();
                    continue;
                }

                $oldSize = filesize($fullPath);

                if ($oldSize === false) {
                    $this->newLine();
                    $this->warn("Could not read file size: {$imagePath}");
                    $errors++;
                    $bar->advance();
                    continue;
                }

                if ($minSizeKb > 0 && $oldSize < ($minSizeKb * 1024)) {
                    $skippedSmall++;
                    $bar->advance();
                    continue;
                }

                if (!$dryRun) {
                    try {
                        $image = $manager->read($fullPath);

                        $targetWidth = (int) round($image->width() * ($scale / 100));
                        $targetWidth = max(1, $targetWidth);

                        $image->scale(width: $targetWidth);

                        $currentQuality = $quality;
                        $encoded = $image->toWebp(quality: $currentQuality);
                        file_put_contents($fullPath, $encoded);

                        clearstatcache(true, $fullPath);

                        if ($maxSizeKb > 0) {
                            $currentSize = filesize($fullPath);

                            if ($currentSize !== false) {
                                while ($currentSize > ($maxSizeKb * 1024) && $currentQuality > $minQuality) {
                                    $currentQuality = max($minQuality, $currentQuality - $qualityStep);
                                    $encoded = $image->toWebp(quality: $currentQuality);
                                    file_put_contents($fullPath, $encoded);
                                    clearstatcache(true, $fullPath);
                                    $currentSize = filesize($fullPath);
                                    if ($currentSize === false) {
                                        break;
                                    }
                                }

                                if ($currentSize !== false && $currentSize > ($maxSizeKb * 1024)) {
                                    $aboveMaxSize++;
                                }
                            }
                        }
                        $resized++;

                    } catch (\Exception $e) {
                        $this->newLine();
                        $this->error("Failed to resize {$imagePath}: " . $e->getMessage());
                        $errors++;
                        $bar->advance();
                        continue;
                    }
                } else {
                    $resized++;
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

        $this->info('✅ Resize complete!');
        $this->table(
            ['Status', 'Count'],
            [
                ['Resized', $resized],
                ['Skipped (non-WebP)', $skippedNonWebp],
                ['Skipped (below min size)', $skippedSmall],
                ['Above max size', $aboveMaxSize],
                ['Errors', $errors],
                ['Total', $totalImages],
            ]
        );

        if ($dryRun) {
            $this->warn('This was a DRY RUN. Run without --dry-run to actually resize images.');
        }

        return 0;
    }
}
