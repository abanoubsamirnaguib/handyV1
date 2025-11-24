<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Order;
use Carbon\Carbon;

class CheckLateOrders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'orders:check-late';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check for late orders and update their status';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Checking for late orders...');
        
        // Get orders that have a deadline and are not completed, cancelled, or ready for delivery
        $orders = Order::whereNotNull('completion_deadline')
                      ->whereNotNull('seller_approved_at')
                      ->whereNotIn('status', ['completed', 'cancelled', 'ready_for_delivery', 'out_for_delivery', 'delivered'])
                      ->where('completion_deadline', '<', now())
                      ->where('is_late', false)
                      ->get();

        $updatedCount = 0;

        foreach ($orders as $order) {
            if ($order->checkIfLate()) {
                $updatedCount++;
                $this->line("Order #{$order->id} marked as late - deadline passed without reaching ready_for_delivery status");
            }
        }

        $this->info("Updated {$updatedCount} orders as late");
        return 0;
    }
}
