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
        $user->update($data);
        
        return new UserResource($user);
    }
    public function destroy($id) {
        $user = User::findOrFail($id);
        $user->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
