<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class AIAssistantCacheStats extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'ai-assistant:cache-stats';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Show AI Assistant cache statistics';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $cacheKeys = [
            'ai_assistant:products_list',
            'ai_assistant:sellers_list',
            'ai_assistant:categories_list',
        ];

        $this->info('AI Assistant Cache Statistics:');
        $this->newLine();

        foreach ($cacheKeys as $key) {
            $exists = Cache::has($key);
            $this->line("{$key}: " . ($exists ? '✓ Cached' : '✗ Not cached'));
        }

        // Count total cache entries for AI assistant
        $prefix = config('cache.prefix', '');
        $totalEntries = DB::table('cache')
            ->where('key', 'like', $prefix . 'ai_assistant:%')
            ->count();

        $this->newLine();
        $this->info("Total AI Assistant cache entries: {$totalEntries}");
        
        // Show cache size
        $cacheSize = DB::table('cache')
            ->where('key', 'like', $prefix . 'ai_assistant:%')
            ->sum(DB::raw('LENGTH(value)'));
        
        $this->info("Total cache size: " . $this->formatBytes($cacheSize));
    }

    /**
     * Format bytes to human readable format
     */
    private function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, $precision) . ' ' . $units[$i];
    }
}

