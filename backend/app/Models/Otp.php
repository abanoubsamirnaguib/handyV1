<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Otp extends Model
{
    protected $fillable = [
        'email',
        'otp_code',
        'type',
        'expires_at',
        'is_used'
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'is_used' => 'boolean'
    ];

    /**
     * Generate a 4-digit OTP code
     */
    public static function generateCode()
    {
        return str_pad(random_int(0, 9999), 4, '0', STR_PAD_LEFT);
    }

    /**
     * Create an OTP for email verification
     */
    public static function createForEmailVerification($email)
    {
        // Delete any existing unused OTPs for this email and type
        self::where('email', $email)
            ->where('type', 'email_verification')
            ->where('is_used', false)
            ->delete();

        return self::create([
            'email' => $email,
            'otp_code' => self::generateCode(),
            'type' => 'email_verification',
            'expires_at' => Carbon::now()->addMinutes(10),
            'is_used' => false
        ]);
    }

    /**
     * Create an OTP for password reset
     */
    public static function createForPasswordReset($email)
    {
        // Delete any existing unused OTPs for this email and type
        self::where('email', $email)
            ->where('type', 'password_reset')
            ->where('is_used', false)
            ->delete();

        return self::create([
            'email' => $email,
            'otp_code' => self::generateCode(),
            'type' => 'password_reset',
            'expires_at' => Carbon::now()->addMinutes(15),
            'is_used' => false
        ]);
    }

    /**
     * Check if OTP is valid without marking it as used
     * This is used for verification steps that don't consume the OTP
     */
    public static function isValidOtp($email, $code, $type)
    {
        return self::where('email', $email)
            ->where('otp_code', $code)
            ->where('type', $type)
            ->where('is_used', false)
            ->where('expires_at', '>', Carbon::now())
            ->exists();
    }

    /**
     * Verify an OTP code and mark it as used
     * This is used for final verification steps that consume the OTP
     */
    public static function verify($email, $code, $type)
    {
        $otp = self::where('email', $email)
            ->where('otp_code', $code)
            ->where('type', $type)
            ->where('is_used', false)
            ->where('expires_at', '>', Carbon::now())
            ->first();

        if ($otp) {
            $otp->is_used = true;
            $otp->save();
            return true;
        }

        return false;
    }

    /**
     * Check if OTP is expired
     */
    public function isExpired()
    {
        return Carbon::now()->gt($this->expires_at);
    }

    /**
     * Check if OTP is valid (not used and not expired)
     */
    public function isValid()
    {
        return !$this->is_used && !$this->isExpired();
    }
}
