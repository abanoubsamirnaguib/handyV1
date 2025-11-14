<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Seller extends Model
{
    use HasFactory;
    protected $table = 'sellers';
    protected $fillable = [
        'user_id',
        'member_since',
        'rating',
        'review_count',
        'completed_orders',
        'wallet_balance',
        'created_at',
        'updated_at',
    ];
    public $timestamps = false;

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
    public function skills()
    {
        return $this->hasMany(SellerSkill::class);
    }
    
    public function products()
    {
        return $this->hasMany(Product::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    // Get all reviews for this seller's products
    public function reviews()
    {
        return Review::whereHas('product', function($query) {
            $query->where('seller_id', $this->id);
        })->where('status', 'published');
    }

    // Calculate average rating from all product reviews
    public function getAverageRating()
    {
        return $this->reviews()->avg('rating') ?? 0;
    }

    // Get total review count
    public function getReviewCount()
    {
        return $this->reviews()->count();
    }

    // Update seller rating and review count
    public function updateRatingStats()
    {
        $this->update([
            'rating' => $this->getAverageRating(),
            'review_count' => $this->getReviewCount()
        ]);
    }

    // Wallet and withdrawal relationships
    public function withdrawalRequests()
    {
        return $this->hasMany(WithdrawalRequest::class);
    }

    // Add money to wallet when order is completed
    public function addToWallet($amount)
    {
        $this->increment('wallet_balance', $amount);
    }

    // Deduct money from wallet when withdrawal is approved
    public function deductFromWallet($amount)
    {
        if ($this->wallet_balance < $amount) {
            throw new \Exception('Insufficient wallet balance');
        }
        $this->decrement('wallet_balance', $amount);
    }

    // Get total earnings from completed orders
    public function getTotalEarnings()
    {
        return Order::where('seller_id', $this->id)
                   ->where('status', 'completed')
                   ->sum('total_price');
    }

    // Get pending earnings from orders not yet completed
    public function getPendingEarnings()
    {
        return Order::where('seller_id', $this->id)
                   ->whereIn('status', ['pending', 'admin_approved', 'seller_approved', 'in_progress', 'ready_for_delivery', 'out_for_delivery', 'delivered'])
                   ->sum('total_price');
    }

    // Get total withdrawn amount
    public function getTotalWithdrawn()
    {
        return $this->withdrawalRequests()
                   ->where('status', 'approved')
                   ->sum('amount');
    }

    // Get available balance for withdrawal (wallet balance)
    public function getAvailableForWithdrawal()
    {
        return $this->wallet_balance;
    }

    // Get monthly earnings breakdown
    public function getMonthlyEarnings($year = null)
    {
        $year = $year ?? now()->year;
        
        return Order::where('seller_id', $this->id)
                   ->where('status', 'completed')
                   ->whereYear('completed_at', $year)
                   ->selectRaw('MONTH(completed_at) as month, SUM(total_price) as earnings')
                   ->groupBy('month')
                   ->orderBy('month')
                   ->get();
    }
}
