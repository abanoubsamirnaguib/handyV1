# SendGrid Setup Guide for Password Reset & Email Verification

This guide explains how to set up SendGrid for the password reset and email verification functionality.

## Prerequisites

1. A SendGrid account (free tier available)
2. A verified sender email address in SendGrid
3. An API key from SendGrid

## Setup Steps

### 1. Create SendGrid Account

1. Go to [SendGrid](https://sendgrid.com/)
2. Sign up for a free account
3. Verify your email address

### 2. Verify Sender Email

1. Go to SendGrid Dashboard > Settings > Sender Authentication
2. Add and verify your sender email address
3. This will be the email address that sends the OTP codes

### 3. Create API Key

1. Go to SendGrid Dashboard > Settings > API Keys
2. Click "Create API Key"
3. Choose "Restricted Access"
4. Give it a name like "Laravel App"
5. Select the following permissions:
   - Mail Send: Full Access
6. Copy the generated API key (you won't see it again!)

### 4. Configure Environment Variables

Add the following environment variables to your `.env` file in the backend directory:

```env
# SendGrid Configuration
SENDGRID_API_KEY=your_actual_sendgrid_api_key_here

# Mail Configuration
MAIL_FROM_ADDRESS=your_verified_sender_email@example.com
MAIL_FROM_NAME="Your App Name"
```

### 5. Test the Configuration

After setting up the environment variables, test the email functionality:

1. Try the password reset feature from the login page
2. Try the email verification during registration
3. Check your email for the OTP codes

## API Endpoints

The following API endpoints are available for email functionality:

### Registration with Email Verification
- `POST /api/send-email-verification-otp` - Send OTP for email verification
- `POST /api/verify-email` - Verify email with OTP
- `POST /api/register-with-verification` - Register user with verified email

### Password Reset
- `POST /api/send-password-reset-otp` - Send OTP for password reset
- `POST /api/verify-password-reset-otp` - Verify password reset OTP
- `POST /api/reset-password` - Reset password with OTP

## Frontend Pages

The following new pages have been added:

1. **ForgotPasswordPage** (`/forgot-password`) - Enter email to receive reset code
2. **ResetPasswordPage** (`/reset-password`) - Enter OTP and new password
3. **EmailVerificationPage** (`/verify-email`) - Verify email during registration

## Database Changes

New tables and columns added:

### OTPs Table
- `id` - Primary key
- `email` - Email address
- `otp_code` - 4-digit OTP code
- `type` - 'email_verification' or 'password_reset'
- `expires_at` - Expiration timestamp
- `is_used` - Boolean flag
- `created_at`, `updated_at` - Timestamps

### Users Table (Updated)
- `email_verified` - Boolean flag for email verification status

## Security Features

1. **OTP Expiration**: Email verification OTPs expire in 10 minutes, password reset OTPs in 15 minutes
2. **Single Use**: OTPs can only be used once
3. **Auto Cleanup**: Old/used OTPs are automatically cleaned up when new ones are generated
4. **Token Revocation**: All user tokens are revoked after password reset for security

## Troubleshooting

### Common Issues:

1. **"Failed to send email"**: Check your SendGrid API key and sender verification
2. **"Invalid OTP"**: Ensure the OTP is exactly 4 digits and not expired
3. **"Email already verified"**: The email is already verified, user can log in normally

### Testing in Development:

For development testing, you can temporarily set `MAIL_MAILER=log` in your `.env` file to log emails instead of sending them. Check `storage/logs/laravel.log` for the email content.

## Production Considerations

1. Use a professional email address for the sender
2. Set up proper DNS records for your domain
3. Monitor SendGrid usage and quotas
4. Consider implementing rate limiting for OTP requests
5. Set up proper error monitoring for email failures 