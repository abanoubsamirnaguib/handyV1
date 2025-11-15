<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class ClearAIAssistantCache extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'ai-assistant:clear-cache';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clear AI Assistant cache';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $prefix = config('cache.prefix', '');
        
        // Clear all AI assistant related cache
        $deleted = DB::table('cache')
            ->where('key', 'like', $prefix . 'ai_assistant:%')
            ->delete();

        $this->info("Cleared {$deleted} cache entries.");
        
        // Also clear using Cache facade for specific keys
        Cache::forget('ai_assistant:products_list');
        Cache::forget('ai_assistant:sellers_list');
        Cache::forget('ai_assistant:categories_list');
        
        $this->info('AI Assistant cache cleared successfully!');
    }
}

