<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PostEmbed extends Model
{
    use HasFactory;

    protected $fillable = [
        'post_id',
        'provider',
        'original_url',
        'embed_url',
        'embed_id',
        'thumbnail_url',
    ];
}
