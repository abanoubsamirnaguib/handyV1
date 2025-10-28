<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BuyerWithdrawalRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'amount',
        'payment_method',
        'payment_details',
        'status',
        'admin_notes',
        'rejection_reason',
        'processed_by',
        'processed_at',
    ];

    protected $dates = [
        'processed_at',
        'created_at',
        'updated_at',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function processedBy()
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    public function isPending()
    {
        return $this->status === 'pending';
    }

    public function isApproved()
    {
        return $this->status === 'approved';
    }

    public function isRejected()
    {
        return $this->status === 'rejected';
    }

    public function approve($adminId, $notes = null)
    {
        if (!$this->isPending()) {
            throw new \Exception('يمكن الموافقة على الطلبات المعلقة فقط');
        }

        // Deduct amount from buyer's wallet
        $this->user->deductFromBuyerWallet($this->amount);

        $this->update([
            'status' => 'approved',
            'processed_by' => $adminId,
            'processed_at' => now(),
            'admin_notes' => $notes
        ]);
    }

    public function reject($adminId, $reason)
    {
        if (!$this->isPending()) {
            throw new \Exception('يمكن رفض الطلبات المعلقة فقط');
        }

        $this->update([
            'status' => 'rejected',
            'processed_by' => $adminId,
            'processed_at' => now(),
            'rejection_reason' => $reason
        ]);
    }

    public function getStatusLabel()
    {
        $labels = [
            'pending' => 'قيد المراجعة',
            'approved' => 'تم الموافقة',
            'rejected' => 'مرفوض'
        ];
        return $labels[$this->status] ?? $this->status;
    }

    public function getPaymentMethodLabel()
    {
        $labels = [
            'vodafone_cash' => 'فودافون كاش',
            'instapay' => 'انستاباي',
            'etisalat_cash' => 'اتصالات كاش',
            'orange_cash' => 'أورانج كاش',
            'bank_transfer' => 'تحويل بنكي'
        ];
        return $labels[$this->payment_method] ?? $this->payment_method;
    }
}


