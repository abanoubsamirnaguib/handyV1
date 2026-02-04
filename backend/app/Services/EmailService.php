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

    /**
     * Send announcement email to a user
     */
    public function sendAnnouncementEmail($email, $announcement)
    {
        try {
            $data = [
                'announcement' => $announcement,
                'appName' => config('app.name', 'بازار')
            ];
            
            self::sendMail(
                'إعلان جديد: ' . $announcement->title,
                $email,
                $data,
                'emails.announcement-created'
            );
            
            return true;
        } catch (\Exception $e) {
            Log::error('Failed to send announcement email', [
                'email' => $email,
                'announcement_id' => $announcement->id,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Send announcement emails to multiple users
     */
    public function sendAnnouncementToUsers($announcement, $emails)
    {
        $successCount = 0;
        $failureCount = 0;

        foreach ($emails as $email) {
            if ($this->sendAnnouncementEmail($email, $announcement)) {
                $successCount++;
            } else {
                $failureCount++;
            }
            
            // Small delay to prevent overwhelming the API
            usleep(100000); // 0.1 second delay
        }

        Log::info('Announcement emails sent', [
            'announcement_id' => $announcement->id,
            'success' => $successCount,
            'failed' => $failureCount,
            'total' => count($emails)
        ]);

        return [
            'success' => $successCount,
            'failed' => $failureCount,
            'total' => count($emails)
        ];
    }
} 