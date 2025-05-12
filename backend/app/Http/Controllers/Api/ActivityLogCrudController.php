<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class ActivityLogCrudController extends Controller
{
    public function index() { return ActivityLog::with('user')->get(); }
    public function store(Request $request) {
        $validated = $request->validate([
            'user_id' => 'nullable|exists:users,id',
            'activity_type' => 'required|string',
            'activity_description' => 'required|string',
            'ip_address' => 'nullable|string',
            'user_agent' => 'nullable|string',
        ]);
        $log = ActivityLog::create($validated);
        return response()->json($log, 201);
    }
    public function update(Request $request, $id) {
        $log = ActivityLog::findOrFail($id);
        $log->update($request->all());
        return response()->json($log);
    }
    public function destroy($id) {
        $log = ActivityLog::findOrFail($id);
        $log->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
