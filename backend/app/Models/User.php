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
        'phone',
        'email_verified'
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
            'is_seller' => 'boolean',
            'is_buyer' => 'boolean',
            'email_verified' => 'boolean',
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
                'member_since' => now(),
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
                'member_since' => now(),
            ]);
        }
        
        return $this;
    }

    /**
     * Get avatar URL with full path if not already a full URL
     */
    public function getAvatarUrlAttribute()
    {
        if (!$this->avatar) {
            return null;
        }

        // If the URL already starts with http:// or https://, return as-is
        if (str_starts_with($this->avatar, 'http://') || str_starts_with($this->avatar, 'https://')) {
            return $this->avatar;
        }
        
        // Otherwise, prepend APP_URL and storage path
        return config('app.url') . '/storage/' . ltrim($this->avatar, '/');
    }

    public function getSkillsAttribute()
    {
        if ($this->seller) {
            return $this->seller->skills->pluck('skill_name')->toArray();
        }
        return [];
    }
}
