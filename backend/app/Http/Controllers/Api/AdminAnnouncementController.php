<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\User;
use App\Http\Resources\AnnouncementResource;
use App\Services\EmailService;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class AdminAnnouncementController extends Controller
{
    /**
     * عرض جميع الإعلانات للأدمن
     */
    public function index(Request $request): JsonResponse
    {
        $query = Announcement::with('creator:id,name')
            ->orderBy('created_at', 'desc');

        // تصفية حسب الحالة
        if ($request->has('status') && $request->status) {
            switch ($request->status) {
                case 'active':
                    $query->where('is_active', true);
                    break;
                case 'inactive':
                    $query->where('is_active', false);
                    break;
            }
        }

        // تصفية حسب النوع
        if ($request->has('type') && $request->type) {
            $query->byType($request->type);
        }

        // تصفية حسب الأولوية
        if ($request->has('priority') && $request->priority) {
            $query->byPriority($request->priority);
        }

        // البحث
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
            });
        }

        $perPage = $request->get('per_page', 15);
        $announcements = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => AnnouncementResource::collection($announcements->items()),
            'pagination' => [
                'current_page' => $announcements->currentPage(),
                'last_page' => $announcements->lastPage(),
                'per_page' => $announcements->perPage(),
                'total' => $announcements->total(),
            ]
        ]);
    }

    /**
     * إنشاء إعلان جديد
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'type' => 'required|in:info,warning,success,error',
            'priority' => 'required|in:low,medium,high',
            'is_active' => 'boolean',
            'starts_at' => 'nullable|date|after_or_equal:now',
            'ends_at' => 'nullable|date|after:starts_at',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'بيانات غير صحيحة',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $validator->validated();
        $data['created_by'] = auth()->id();

        // رفع الصورة إذا كانت موجودة
        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $imagePath = $image->store('announcements', 'public');
            $data['image'] = $imagePath;
        }

        $announcement = Announcement::create($data);
        $announcement->load('creator:id,name');

        // Send notifications and emails to all active users
        try {
            // Get all active users
            $activeUsers = User::where('status', 'active')
                ->whereNotNull('email')
                ->get();
            
            if ($activeUsers->count() > 0) {
                // Get user IDs for notifications
                $userIds = $activeUsers->pluck('id')->toArray();
                
                // Create database notifications with push notifications
                NotificationService::broadcastAnnouncement($announcement, $userIds);
                
                // Send email notifications to users who have email notifications enabled
                $usersWithEmailEnabled = $activeUsers->where('email_notifications', true);
                if ($usersWithEmailEnabled->count() > 0) {
                    $emailService = new EmailService();
                    $emailResults = $emailService->sendAnnouncementToUsers(
                        $announcement, 
                        $usersWithEmailEnabled->pluck('email')->toArray()
                    );
                    
                    Log::info("Announcement notifications sent", [
                        'announcement_id' => $announcement->id,
                        'database_notifications' => count($userIds),
                        'email_results' => $emailResults
                    ]);
                }
            }
        } catch (\Exception $e) {
            // Log the error but don't fail the announcement creation
            Log::error("Failed to send announcement notifications: " . $e->getMessage(), [
                'announcement_id' => $announcement->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'تم إنشاء الإعلان بنجاح وإرسال الإشعارات',
            'data' => new AnnouncementResource($announcement)
        ], 201);
    }

    /**
     * عرض إعلان واحد
     */
    public function show($id): JsonResponse
    {
        $announcement = Announcement::with('creator:id,name')->find($id);

        if (!$announcement) {
            return response()->json([
                'success' => false,
                'message' => 'الإعلان غير موجود'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => new AnnouncementResource($announcement)
        ]);
    }

    /**
     * تحديث الإعلان
     */
    public function update(Request $request, $id): JsonResponse
    {
        $announcement = Announcement::find($id);

        if (!$announcement) {
            return response()->json([
                'success' => false,
                'message' => 'الإعلان غير موجود'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'type' => 'required|in:info,warning,success,error',
            'priority' => 'required|in:low,medium,high',
            'is_active' => 'boolean',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date|after:starts_at',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'بيانات غير صحيحة',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $validator->validated();

        // رفع صورة جديدة إذا كانت موجودة
        if ($request->hasFile('image')) {
            // حذف الصورة القديمة
            if ($announcement->image) {
                Storage::disk('public')->delete($announcement->image);
            }
            
            $image = $request->file('image');
            $imagePath = $image->store('announcements', 'public');
            $data['image'] = $imagePath;
        }

        $announcement->update($data);
        $announcement->load('creator:id,name');

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث الإعلان بنجاح',
            'data' => new AnnouncementResource($announcement)
        ]);
    }

    /**
     * حذف الإعلان
     */
    public function destroy($id): JsonResponse
    {
        $announcement = Announcement::find($id);

        if (!$announcement) {
            return response()->json([
                'success' => false,
                'message' => 'الإعلان غير موجود'
            ], 404);
        }

        // حذف الصورة إذا كانت موجودة
        if ($announcement->image) {
            Storage::disk('public')->delete($announcement->image);
        }

        $announcement->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم حذف الإعلان بنجاح'
        ]);
    }

    /**
     * تغيير حالة الإعلان (تفعيل/إلغاء تفعيل)
     */
    public function toggleStatus($id): JsonResponse
    {
        $announcement = Announcement::find($id);

        if (!$announcement) {
            return response()->json([
                'success' => false,
                'message' => 'الإعلان غير موجود'
            ], 404);
        }

        $announcement->update([
            'is_active' => !$announcement->is_active
        ]);

        return response()->json([
            'success' => true,
            'message' => $announcement->is_active ? 'تم تفعيل الإعلان' : 'تم إلغاء تفعيل الإعلان',
            'data' => new AnnouncementResource($announcement)
        ]);
    }

    /**
     * إحصائيات الإعلانات للأدمن
     */
    public function stats(): JsonResponse
    {
        $stats = [
            'total' => Announcement::count(),
            'active' => Announcement::where('is_active', true)->count(),
            'inactive' => Announcement::where('is_active', false)->count(),
            'visible' => Announcement::visible()->count(),
            'by_type' => [
                'info' => Announcement::byType('info')->count(),
                'warning' => Announcement::byType('warning')->count(),
                'success' => Announcement::byType('success')->count(),
                'error' => Announcement::byType('error')->count(),
            ],
            'by_priority' => [
                'high' => Announcement::byPriority('high')->count(),
                'medium' => Announcement::byPriority('medium')->count(),
                'low' => Announcement::byPriority('low')->count(),
            ]
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
} 