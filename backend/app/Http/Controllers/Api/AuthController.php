<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Otp;
use App\Services\EmailService;
use App\Services\NotificationService;
use App\Traits\EmailTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Exception;

class AuthController extends Controller
{
    use EmailTrait;

    public function login(Request $request)
    {
        try {
            // Validate request without CSRF
            $credentials = $request->validate([
                'email' => 'required|email',
                'password' => 'required|string',
            ]);            
            // Check if user exists
            $user = User::where('email', $credentials['email'])->first();
            if (!$user) {
                Log::info('User not found', ['email' => $credentials['email']]);
                return response()->json([
                    'message' => 'The provided credentials are incorrect.',
                ], 401);
            }
            
            // Verify password manually to avoid session issues
            if (!Hash::check($credentials['password'], $user->password)) {
                Log::info('Password verification failed', ['email' => $credentials['email']]);
                return response()->json([
                    'message' => 'البيانات التي قمت بإدخالها غير صحيحة'
                ], 401);
            }
            // If user is inactive, return error            
            $token = $user->createToken('api-token')->plainTextToken;
            
            // Load seller relationship with skills if user is a seller
            if ($user->active_role === 'seller' || $user->is_seller) {
                $user->load('seller.skills');
            }
            
            return response()->json([
                'token' => $token, 
                'user' => new \App\Http\Resources\UserResource($user)
            ]);
            
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Login failed',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    public function me(Request $request)
    {
        $user = $request->user();
        
        // If user is not logged in, return 401 Unauthorized
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }
        
        // Load seller relationship with skills if user is a seller
        if ($user->active_role === 'seller' || $user->is_seller) {
            $user->load('seller.skills');
        }
        
        // Return the user with all profile fields using the UserResource
        return new \App\Http\Resources\UserResource($user);
    }

    public function logout(Request $request)
    {
        // Revoke all tokens...
        // $request->user()->tokens()->delete();
        
        // Or revoke the token that was used to authenticate the current request...
        $request->user()->currentAccessToken()->delete();
        
        return response()->json(['message' => 'Successfully logged out']);
    }

    public function checkToken(Request $request)
    {
        $user = $request->user();
        
        // Load seller relationship with skills if user is a seller
        if ($user && ($user->active_role === 'seller' || $user->is_seller)) {
            $user->load('seller.skills');
        }
        
        return response()->json([
            'valid' => true,
            'user' => new \App\Http\Resources\UserResource($user)
        ]);
    }

    public function switchRole(Request $request)
    {
        try {
            $user = $request->user();
            
            $validated = $request->validate([
                'role' => 'required|in:seller,buyer',
            ]);
            
            $targetRole = $validated['role'];
            
            // Check if user can switch to the requested role
            if ($targetRole === 'seller' && !$user->canActAsSeller()) {
                return response()->json([
                    'message' => 'You need to enable seller mode first',
                ], 403);
            }
            
            if ($targetRole === 'buyer' && !$user->canActAsBuyer()) {
                return response()->json([
                    'message' => 'You cannot act as a buyer',
                ], 403);
            }
            
            // Switch to the requested role
            if ($targetRole === 'seller') {
                $user->switchToSeller();
            } else {
                $user->switchToBuyer();
            }
            
            // Refresh user data and load seller relationship if needed
            $user = $user->fresh();
            if ($user->active_role === 'seller' || $user->is_seller) {
                $user->load('seller.skills');
            }
            
            return response()->json([
                'message' => 'Role switched successfully',
                'user' => new \App\Http\Resources\UserResource($user)
            ]);
            
        } catch (Exception $e) {
            Log::error('Role switch error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'user_id' => $request->user()->id ?? null
            ]);
            return response()->json([
                'message' => 'Failed to switch role',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    public function enableSellerMode(Request $request)
    {
        try {
            $user = $request->user();
            
            // Enable seller capabilities
            $user->enableSellerMode();
            
            // Refresh user data and load seller relationship
            $user = $user->fresh();
            if ($user->active_role === 'seller' || $user->is_seller) {
                $user->load('seller.skills');
            }
            
            return response()->json([
                'message' => 'Seller mode enabled successfully',
                'user' => new \App\Http\Resources\UserResource($user)
            ]);
            
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Failed to enable seller mode',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    public function changePassword(Request $request)
    {
        $user = $request->user();
        $validated = $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:6|confirmed',
        ]);

        // Check current password
        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'message' => 'كلمة المرور الحالية غير صحيحة.'
            ], 422);
        }

        // Update password
        $user->password = Hash::make($validated['new_password']);
        $user->save();

        return response()->json([
            'message' => 'تم تغيير كلمة المرور بنجاح.'
        ]);
    }

    /**
     * Send OTP for email verification during registration
     */
    public function sendEmailVerificationOTP(Request $request)
    {
        try {
            $validated = $request->validate([
                'email' => 'required|email'
            ]);

            $email = $validated['email'];
            
            // Check if email already exists and is verified
            $existingUser = User::where('email', $email)->first();
            if ($existingUser && $existingUser->email_verified) {
                return response()->json([
                    'message' => 'Email is already verified'
                ], 422);
            }

            // Create OTP
            $otp = Otp::createForEmailVerification($email);
            
            // Send email
            $emailService = new EmailService();
            $emailSent = $emailService->sendEmailVerificationOTP($email, $otp->otp_code);
            
            if (!$emailSent) {
                return response()->json([
                    'message' => 'Failed to send verification email'
                ], 500);
            }

            return response()->json([
                'message' => 'Verification code sent to your email',
                'expires_in_minutes' => 10
            ]);
            
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (Exception $e) {
            Log::error('Send email verification OTP error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to send verification code',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Verify email with OTP code
     */
    public function verifyEmail(Request $request)
    {
        try {
            $validated = $request->validate([
                'email' => 'required|email',
                'otp_code' => 'required|string|size:4'
            ]);

            $email = $validated['email'];
            $otpCode = $validated['otp_code'];
            
            // Verify OTP
            $isValidOTP = Otp::verify($email, $otpCode, 'email_verification');
            
            if (!$isValidOTP) {
                return response()->json([
                    'message' => 'Invalid or expired verification code'
                ], 422);
            }

            // Update user email verification status
            $user = User::where('email', $email)->first();
            if ($user) {
                $user->email_verified = true;
                $user->email_verified_at = now();
                $user->save();
            }

            return response()->json([
                'message' => 'Email verified successfully'
            ]);
            
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (Exception $e) {
            Log::error('Verify email error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Email verification failed',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Send password reset OTP
     */
    public function sendPasswordResetOTP(Request $request)
    {
        try {
            $validated = $request->validate([
                'email' => 'required|email'
            ]);

            $email = $validated['email'];
            
            // Check if user exists
            $user = User::where('email', $email)->first();
            if (!$user) {
                return response()->json([
                    'message' => 'No user found with this email address'
                ], 404);
            }

            // Create OTP
            $otp = Otp::createForPasswordReset($email);
            
            // Send email
            $emailService = new EmailService();
            $emailSent = $emailService->sendPasswordResetOTP($email, $otp->otp_code);
            
            if (!$emailSent) {
                return response()->json([
                    'message' => 'Failed to send password reset email'
                ], 500);
            }

            return response()->json([
                'message' => 'Password reset code sent to your email',
                'expires_in_minutes' => 15
            ]);
            
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (Exception $e) {
            Log::error('Send password reset OTP error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to send password reset code',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Verify password reset OTP
     */
    public function verifyPasswordResetOTP(Request $request)
    {
        try {
            $validated = $request->validate([
                'email' => 'required|email',
                'otp_code' => 'required|string|size:4'
            ]);

            $email = $validated['email'];
            $otpCode = $validated['otp_code'];
            
            // Check OTP validity without marking it as used
            $isValidOTP = Otp::isValidOtp($email, $otpCode, 'password_reset');
            
            if (!$isValidOTP) {
                return response()->json([
                    'message' => 'Invalid or expired reset code'
                ], 422);
            }

            return response()->json([
                'message' => 'Reset code verified successfully',
                'can_reset_password' => true
            ]);
            
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (Exception $e) {
            Log::error('Verify password reset OTP error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Code verification failed',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Reset password after OTP verification
     */
    public function resetPassword(Request $request)
    {
        try {
            $validated = $request->validate([
                'email' => 'required|email',
                'otp_code' => 'required|string|size:4',
                'password' => 'required|string|min:6|confirmed'
            ]);

            $email = $validated['email'];
            $otpCode = $validated['otp_code'];
            $newPassword = $validated['password'];
            
            // Verify OTP again for security
            $isValidOTP = Otp::verify($email, $otpCode, 'password_reset');
            
            if (!$isValidOTP) {
                return response()->json([
                    'message' => 'Invalid or expired reset code'
                ], 422);
            }

            // Find user and update password
            $user = User::where('email', $email)->first();
            if (!$user) {
                return response()->json([
                    'message' => 'User not found'
                ], 404);
            }

            $user->password = Hash::make($newPassword);
            $user->save();

            // Revoke all existing tokens for security
            $user->tokens()->delete();

            return response()->json([
                'message' => 'Password reset successfully'
            ]);
            
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (Exception $e) {
            Log::error('Reset password error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Password reset failed',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Updated register method to require email verification
     */
    public function registerWithEmailVerification(Request $request)
    {
        try {
            Log::info('Registration with email verification attempt started', ['email' => $request->input('email')]);
            
            $validated = $request->validate([
                'name' => 'required|string|max:100',
                'email' => 'required|email|unique:users,email',
                'password' => 'required|string|min:6',
                'otp_code' => 'required|string|size:4',
                'role' => 'in:admin,seller,buyer',
                'is_seller' => 'boolean',
                'is_buyer' => 'boolean',
            ]);
            
            // Verify OTP first
            $isValidOTP = Otp::verify($validated['email'], $validated['otp_code'], 'email_verification');
            
            if (!$isValidOTP) {
                return response()->json([
                    'message' => 'Invalid or expired verification code'
                ], 422);
            }

            // Set default dual role values
            $isSeller = $validated['is_seller'] ?? ($validated['role'] === 'seller');
            $isBuyer = $validated['is_buyer'] ?? ($validated['role'] === 'buyer' || $validated['role'] === null);
            $activeRole = $validated['role'] === 'seller' ? 'seller' : 'buyer';
            
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => $validated['role'] ?? 'buyer',
                'active_role' => $activeRole,
                'is_seller' => $isSeller,
                'is_buyer' => $isBuyer,
                'status' => 'active',
                'email_verified' => true, // Already verified with OTP
            ]);
            
            // Create seller profile if user is or can be a seller
            if ($isSeller) {
                $seller = \App\Models\Seller::create([
                    'user_id' => $user->id,
                    'member_since' => now(),
                ]);
                
                // Create seller skills if provided in the request
                if ($request->has('skills') && is_array($request->skills)) {
                    foreach ($request->skills as $skill) {
                        \App\Models\SellerSkill::create([
                            'seller_id' => $seller->id,
                            'skill_name' => $skill,
                            'created_at' => now(),
                        ]);
                    }
                }
            }
            
            // Create a token immediately so the user doesn't have to log in separately
            $token = $user->createToken('api-token')->plainTextToken;
            
            // Load seller relationship with skills if user is a seller
            if ($user->active_role === 'seller' || $user->is_seller) {
                $user->load('seller.skills');
            }
            
            // Send welcome notification
            try {
                NotificationService::welcome($user->id, $user->name, $isSeller);
            } catch (Exception $notifError) {
                Log::warning('Failed to send welcome notification', [
                    'user_id' => $user->id,
                    'error' => $notifError->getMessage()
                ]);
            }
            
            // Send welcome email
            try {
                $dashboardUrl = env('FRONTEND_URL', 'http://localhost:5173') . '/dashboard';
                
                self::sendMail(
                    subject: 'مرحباً بك في بازار!',
                    to: $user->email,
                    data: [
                        'name' => $user->name,
                        'is_seller' => $isSeller,
                        'dashboard_url' => $dashboardUrl,
                    ],
                    viewPath: 'emails.welcome'
                );
            } catch (Exception $emailError) {
                Log::warning('Failed to send welcome email', [
                    'user_id' => $user->id,
                    'error' => $emailError->getMessage()
                ]);
            }
            
            Log::info('Registration with email verification successful', ['user_id' => $user->id]);
            
            return response()->json([
                'message' => 'User registered successfully with verified email',
                'user' => new \App\Http\Resources\UserResource($user),
                'token' => $token
            ], 201);
        } catch (ValidationException $e) {
            Log::error('Registration with email verification validation error', ['errors' => $e->errors()]);
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (Exception $e) {
            Log::error('Registration with email verification error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request' => $request->all()
            ]);
            return response()->json([
                'message' => 'Registration failed',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }
}
