<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationCrudController extends Controller
{
    public function index() { return Notification::where('user_id', auth()->id())->with('user')->get(); }
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
    public function unreadCount(Request $request)
    {
        $user = $request->user();
        $count = Notification::where('user_id', $user->id)->where('is_read', false)->count();
        return response()->json(['unread_count' => $count]);
    }
    public function markAsRead(Request $request, $id)
    {
        $user = $request->user();
        $notification = Notification::where('id', $id)->where('user_id', $user->id)->firstOrFail();
        $notification->is_read = true;
        $notification->save();
        return response()->json(['success' => true]);
    }
    public function markAllAsRead(Request $request)
    {
        $user = $request->user();
        Notification::where('user_id', $user->id)->where('is_read', false)->update(['is_read' => true]);
        return response()->json(['success' => true]);
    }
}
