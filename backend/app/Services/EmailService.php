<?php

namespace App\Services;

use App\Traits\EmailTrait;
use Illuminate\Support\Facades\Log;

class EmailService
{
    use EmailTrait;

    public function sendEmailVerificationOTP($email, $otpCode)
    {
        try {
            $data = ['otp_code' => $otpCode];
            
            self::sendMail(
                'Email Verification Code',
                $email,
                $data,
                'emails.verification-otp'
            );
            
            Log::info('Email verification OTP sent successfully', [
                'email' => $email
            ]);
            
            return true;
        } catch (\Exception $e) {
            Log::error('Failed to send email verification OTP', [
                'email' => $email,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Send OTP code for password reset
     */
    public function sendPasswordResetOTP($email, $otpCode)
    {
        try {
            $data = ['otp_code' => $otpCode];
            
            self::sendMail(
                'Password Reset Code',
                $email,
                $data,
                'emails.password-reset-otp'
            );
            
            Log::info('Password reset OTP sent successfully', [
                'email' => $email
            ]);
            
            return true;
        } catch (\Exception $e) {
            Log::error('Failed to send password reset OTP', [
                'email' => $email,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }
} 