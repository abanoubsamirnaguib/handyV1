<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Product;
use App\Models\Order;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\Notification;
use App\Models\Review;
use App\Models\ProductImage;
use App\Models\Transaction;
use App\Models\WishlistItem;
use App\Models\Announcement;
use App\Models\BuyerWithdrawalRequest;
use App\Models\CartItem;
use App\Models\ChatReport;
use App\Models\ContactMessage;
use App\Models\DeliveryPersonnel;
use App\Models\MessageAttachment;
use App\Models\OrderHistory;
use App\Models\OrderItem;
use App\Models\Otp;
use App\Models\Payment;
use App\Models\PlatformProfit;
use App\Models\ProductTag;
use App\Models\Seller;
use App\Models\SellerSkill;
use App\Models\WithdrawalRequest;
use App\Models\ActivityLog;

class CleanDatabaseForProduction extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     * 
     * php artisan db:clean-for-production
     */
    protected $signature = 'db:clean-for-production';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clear all tables except categories, cities, site settings, and admin users for production';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Confirm before proceeding
        if (!$this->confirm('This will clear all data except categories, cities, site settings, and admin users. Proceed?')) {
            return;
        }

        // Delete all specified models
        Announcement::query()->delete();
        BuyerWithdrawalRequest::query()->delete();
        CartItem::query()->delete();
        ChatReport::query()->delete();
        ContactMessage::query()->delete();
        Conversation::query()->delete();
        DeliveryPersonnel::query()->delete();
        Message::query()->delete();
        MessageAttachment::query()->delete();
        Notification::query()->delete();
        Order::query()->delete();
        OrderHistory::query()->delete();
        OrderItem::query()->delete();
        Otp::query()->delete();
        Payment::query()->delete();
        PlatformProfit::query()->delete();
        Product::query()->delete();
        ProductImage::query()->delete();
        ProductTag::query()->delete();
        Review::query()->delete();
        Seller::query()->delete();
        SellerSkill::query()->delete();
        Transaction::query()->delete();
        WishlistItem::query()->delete();
        WithdrawalRequest::query()->delete();
        ActivityLog::query()->delete();

        // Delete all users except admins
        User::where('role', '!=', 'admin')->delete();

        $this->info('All specified data deleted. Categories, cities, site settings, and admin users preserved.');
        $this->info('Database cleaned for production.');
    }
}