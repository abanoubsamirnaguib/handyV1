<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Exception;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        try {
            Log::info('Registration attempt started', ['email' => $request->input('email')]);
            
            $validated = $request->validate([
                'name' => 'required|string|max:100',
                'email' => 'required|email|unique:users,email',
                'password' => 'required|string|min:6',
                'role' => 'in:admin,seller,buyer',
                'is_seller' => 'boolean',
                'is_buyer' => 'boolean',
            ]);
            
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
            
            Log::info('Registration successful', ['user_id' => $user->id]);
            
            return response()->json([
                'message' => 'User registered successfully',
                'user' => new \App\Http\Resources\UserResource($user),
                'token' => $token
            ], 201);
        } catch (ValidationException $e) {
            Log::error('Registration validation error', ['errors' => $e->errors()]);
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (Exception $e) {
            Log::error('Registration error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request' => $request->all()
            ]);
            return response()->json([
                'message' => 'Registration failed',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

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
        return response()->json([
            'valid' => true,
            'user' => new \App\Http\Resources\UserResource($request->user())
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
            
            return response()->json([
                'message' => 'Role switched successfully',
                'user' => new \App\Http\Resources\UserResource($user->fresh())
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
            
            return response()->json([
                'message' => 'Seller mode enabled successfully',
                'user' => new \App\Http\Resources\UserResource($user->fresh())
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
}
