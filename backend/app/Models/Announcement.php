<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Announcement extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'content', 
        'image',
        'type',
        'priority',
        'is_active',
        'starts_at',
        'ends_at',
        'created_by'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
    ];

    // العلاقات
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Scopes للتصفية
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeVisible($query)
    {
        $now = Carbon::now();
        return $query->active()
            ->where(function ($q) use ($now) {
                $q->whereNull('starts_at')
                  ->orWhere('starts_at', '<=', $now);
            })
            ->where(function ($q) use ($now) {
                $q->whereNull('ends_at')
                  ->orWhere('ends_at', '>=', $now);
            });
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeByPriority($query, $priority)
    {
        return $query->where('priority', $priority);
    }

    // Accessors
    public function getIsVisibleAttribute()
    {
        if (!$this->is_active) {
            return false;
        }

        $now = Carbon::now();
        
        if ($this->starts_at && $this->starts_at > $now) {
            return false;
        }
        
        if ($this->ends_at && $this->ends_at < $now) {
            return false;
        }

        return true;
    }

    public function getStatusAttribute()
    {
        if (!$this->is_active) {
            return 'inactive';
        }

        $now = Carbon::now();
        
        if ($this->starts_at && $this->starts_at > $now) {
            return 'scheduled';
        }
        
        if ($this->ends_at && $this->ends_at < $now) {
            return 'expired';
        }

        return 'active';
    }


    public function getImageAttribute($value)
    {
        // If the value is already a full URL, return as-is
        if (str_starts_with($value, 'http://') || str_starts_with($value, 'https://')) {
            return $value;
        }

        // If the value is null or empty, return null
        if (empty($value)) {
            return null;
        }

        // If the value already starts with 'announcements/', treat it as a storage path
        if (str_starts_with($value, 'announcements/')) {
            return config('app.url') . '/storage/' . ltrim($value, '/');
        }

        // Otherwise, prepend APP_URL and storage path
        return config('app.url') . '/storage/announcements/' . ltrim($value, '/');
    }
} 