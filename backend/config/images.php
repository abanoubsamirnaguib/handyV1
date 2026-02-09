<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Image Conversion Settings
    |--------------------------------------------------------------------------
    |
    | These settings control how product images are converted to WebP format
    | when sellers upload products.
    |
    */

    'webp' => [
        // Scale percentage (1-100). 50 means scale to 50% of original resolution
        'scale' => env('IMAGE_WEBP_SCALE', 50),

        // WebP quality (1-100). Higher = better quality but larger file size
        'quality' => env('IMAGE_WEBP_QUALITY', 85),

        // Minimum WebP quality when enforcing max size (1-100)
        'min_quality' => env('IMAGE_WEBP_MIN_QUALITY', 40),

        // Quality step size when reducing quality to meet max size (1-100)
        'quality_step' => env('IMAGE_WEBP_QUALITY_STEP', 5),

        // Minimum file size in KB to process (0 to disable)
        'min_size_kb' => env('IMAGE_WEBP_MIN_SIZE_KB', 0),

        // Maximum file size in KB after resize (0 to disable)
        'max_size_kb' => env('IMAGE_WEBP_MAX_SIZE_KB', 200),
    ],
];
