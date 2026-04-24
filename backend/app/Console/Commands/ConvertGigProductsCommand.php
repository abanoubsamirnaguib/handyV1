<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ConvertGigProductsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'products:convert-gigs-to-products
                            {--dry-run : Show what will be updated without writing changes}
                            {--set-quantity=1 : Quantity value to set when current quantity is NULL}
                            {--yes : Skip confirmation prompt}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Convert all products with type=gig to type=product';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $defaultQuantity = (int) $this->option('set-quantity');

        if ($defaultQuantity < 0) {
            $this->error('The --set-quantity option must be 0 or greater.');
            return self::FAILURE;
        }

        $gigQuery = DB::table('products')->where('type', 'gig');
        $gigCount = (clone $gigQuery)->count();

        if ($gigCount === 0) {
            $this->info('No products with type="gig" were found. Nothing to update.');
            return self::SUCCESS;
        }

        $nullQuantityCount = (clone $gigQuery)->whereNull('quantity')->count();

        $this->line("Found {$gigCount} record(s) with type='gig'.");
        $this->line("Among them, {$nullQuantityCount} record(s) have NULL quantity.");
        $this->line("When converting, NULL quantity will become {$defaultQuantity}.");

        if ($this->option('dry-run')) {
            $this->info('Dry run mode: no changes were written.');
            return self::SUCCESS;
        }

        if (!$this->option('yes') && !$this->confirm('Proceed with converting gig records to product?')) {
            $this->warn('Operation cancelled.');
            return self::SUCCESS;
        }

        $updated = DB::table('products')
            ->where('type', 'gig')
            ->update([
                'type' => 'product',
                'quantity' => DB::raw("COALESCE(quantity, {$defaultQuantity})"),
            ]);

        $this->info("Done. Updated {$updated} record(s) from type='gig' to type='product'.");

        return self::SUCCESS;
    }
}
