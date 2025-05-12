<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SellerSkill extends Model
{
    use HasFactory;
    protected $table = 'seller_skills';
    protected $fillable = [
        'seller_id',
        'skill_name',
        'created_at',
    ];
    public $timestamps = false;

    public function seller()
    {
        return $this->belongsTo(Seller::class);
    }
}
