<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Resources\UserResource;
use App\Http\Requests\UserRequest;

class UserCrudController extends Controller
{
    public function index() 
    { 
        return UserResource::collection(User::all()); 
    }
    
    public function store(UserRequest $request) 
    {
        $validated = $request->validated();
        $validated['password'] = bcrypt($validated['password']);
        $user = User::create($validated);
        return new UserResource($user);
    }

    public function show($id) 
    {
        $user = User::findOrFail($id);
        
        // Load seller relationship with skills if user is a seller
        if ($user->active_role === 'seller' || $user->is_seller) {
            $user->load('seller.skills');
        }
        
        return new UserResource($user);
    }
    
    public function update(UserRequest $request, $id) 
    {
        // Check if the user exists
        $user = User::findOrFail($id);
        
        // Check if the authenticated user is allowed to update this user
        if (auth()->id() != $id && auth()->user()?->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized to update this user'], 403);
        }
        
        $data = $request->validated();
        if(isset($data['password'])) $data['password'] = bcrypt($data['password']);
        
        // Update the user
        $user->update($data);
        
        // If skills were updated and the user is a seller (based on active_role), sync the seller skills
        if (isset($data['skills']) && $user->active_role === 'seller' && $user->seller) {
            // Clear existing skills
            \App\Models\SellerSkill::where('seller_id', $user->seller->id)->delete();
            
            // Create new seller skills from the provided skills array
            if (is_array($data['skills']) && !empty($data['skills'])) {
                foreach ($data['skills'] as $skill) {
                    \App\Models\SellerSkill::create([
                        'seller_id' => $user->seller->id,
                        'skill_name' => $skill,
                        'created_at' => now(),
                    ]);
                }
            }
        }
        
        // Refresh user data and load seller relationship if needed
        $user = $user->fresh();
        if ($user->active_role === 'seller' || $user->is_seller) {
            $user->load('seller.skills');
        }
        
        return new UserResource($user);
    }

    /**
     * Upload user profile image
     */
    public function uploadProfileImage(Request $request, $id)
    {
        $user = User::findOrFail($id);
        
        // Check if the authenticated user is allowed to update this user
        if (auth()->id() != $id && auth()->user()?->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized to update this user'], 403);
        }

        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120', // max 5MB
        ]);

        try {
            // Delete old avatar if exists
            if ($user->avatar && \Storage::disk('public')->exists($user->avatar)) {
                \Storage::disk('public')->delete($user->avatar);
            }

            // Store new avatar
            $avatarPath = $request->file('avatar')->store('avatars', 'public');
            
            // Update user avatar path
            $user->update(['avatar' => $avatarPath]);
            
            // Load seller relationship if needed
            if ($user->active_role === 'seller' || $user->is_seller) {
                $user->load('seller.skills');
            }

            return response()->json([
                'message' => 'Profile image updated successfully',
                'data' => new UserResource($user),
                'avatar_url' => \Storage::disk('public')->url($avatarPath)
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to upload profile image',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id) {
        $user = User::findOrFail($id);
        $user->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
