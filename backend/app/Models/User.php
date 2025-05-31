<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'active_role',
        'is_seller',
        'is_buyer',
        'status',
        'bio',
        'location',
        'avatar',
        'skills',
        'phone'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'skills' => 'array',
            'is_seller' => 'boolean',
            'is_buyer' => 'boolean',
        ];
    }

    /**
     * Get the seller profile associated with the user.
     */
    public function seller()
    {
        return $this->hasOne(Seller::class);
    }

    /**
     * Check if user can act as seller
     */
    public function canActAsSeller()
    {
        return $this->is_seller || $this->role === 'seller';
    }

    /**
     * Check if user can act as buyer
     */
    public function canActAsBuyer()
    {
        return $this->is_buyer || $this->role === 'buyer';
    }

    /**
     * Switch to seller role
     */
    public function switchToSeller()
    {
        if (!$this->canActAsSeller()) {
            throw new \Exception('User cannot act as seller');
        }
        
        $this->active_role = 'seller';
        $this->save();
        
        // Create seller profile if it doesn't exist
        if (!$this->seller) {
            Seller::create([
                'user_id' => $this->id,
                'bio' => $this->bio,
                'location' => $this->location,
            ]);
        }
        
        return $this;
    }

    /**
     * Switch to buyer role
     */
    public function switchToBuyer()
    {
        if (!$this->canActAsBuyer()) {
            throw new \Exception('User cannot act as buyer');
        }
        
        $this->active_role = 'buyer';
        $this->save();
        
        return $this;
    }

    /**
     * Enable seller capabilities
     */
    public function enableSellerMode()
    {
        $this->is_seller = true;
        $this->save();
        
        // Create seller profile if it doesn't exist
        if (!$this->seller) {
            Seller::create([
                'user_id' => $this->id,
                'bio' => $this->bio,
                'location' => $this->location,
            ]);
        }
        
        return $this;
    }
}
