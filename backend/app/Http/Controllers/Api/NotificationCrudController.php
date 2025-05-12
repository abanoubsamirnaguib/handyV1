<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationCrudController extends Controller
{
    public function index() { return Notification::with('user')->get(); }
    public function store(Request $request) {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'notification_type' => 'required|string',
            'message' => 'required|string',
            'is_read' => 'boolean',
            'link' => 'nullable|string',
        ]);
        $notification = Notification::create($validated);
        return response()->json($notification, 201);
    }
    public function update(Request $request, $id) {
        $notification = Notification::findOrFail($id);
        $notification->update($request->all());
        return response()->json($notification);
    }
    public function destroy($id) {
        $notification = Notification::findOrFail($id);
        $notification->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
