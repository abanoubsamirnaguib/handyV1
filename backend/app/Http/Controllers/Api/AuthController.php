<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'in:admin,seller,buyer',
        ]);
        
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'] ?? 'buyer',
            'status' => 'active',
        ]);
        
        // Create a token immediately so the user doesn't have to log in separately
        $token = $user->createToken('api-token')->plainTextToken;
        
        return response()->json([
            'message' => 'User registered successfully',
            'user' => new \App\Http\Resources\UserResource($user),
            'token' => $token
        ], 201);
    }public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);
        
        if (!Auth::attempt($credentials)) {
            return response()->json([
                'message' => 'The provided credentials are incorrect.',
            ], 401);
        }
        
        $user = Auth::user();
        $token = $user->createToken('api-token')->plainTextToken;
        
        return response()->json([
            'token' => $token, 
            'user' => new \App\Http\Resources\UserResource($user)
        ]);
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
    }    public function logout(Request $request)
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
}
