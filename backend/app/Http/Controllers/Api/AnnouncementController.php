<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Http\Resources\AnnouncementResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AnnouncementController extends Controller
{
    /**
     * عرض جميع الإعلانات المرئية للزوار
     */
    public function index(Request $request): JsonResponse
    {
        $query = Announcement::visible()
            ->with('creator:id,name')
            ->orderBy('priority', 'desc')
            ->orderBy('created_at', 'desc');

        // تصفية حسب النوع إذا تم تمريره
        if ($request->has('type') && $request->type) {
            $query->byType($request->type);
        }

        // تصفية حسب الأولوية إذا تم تمريرها
        if ($request->has('priority') && $request->priority) {
            $query->byPriority($request->priority);
        }

        // البحث في العنوان والمحتوى
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
            });
        }

        // تطبيق التصفحة
        $perPage = $request->get('per_page', 10);
        $announcements = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => AnnouncementResource::collection($announcements->items()),
            'pagination' => [
                'current_page' => $announcements->currentPage(),
                'last_page' => $announcements->lastPage(),
                'per_page' => $announcements->perPage(),
                'total' => $announcements->total(),
                'has_more_pages' => $announcements->hasMorePages()
            ]
        ]);
    }

    /**
     * عرض إعلان واحد
     */
    public function show($id): JsonResponse
    {
        $announcement = Announcement::visible()
            ->with('creator:id,name')
            ->find($id);

        if (!$announcement) {
            return response()->json([
                'success' => false,
                'message' => 'الإعلان غير موجود أو غير متاح'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => new AnnouncementResource($announcement)
        ]);
    }

    /**
     * الحصول على أحدث الإعلانات (للواجهة الرئيسية)
     */
    public function latest(Request $request): JsonResponse
    {
        $limit = $request->get('limit', 3);
        
        $announcements = Announcement::visible()
            ->with('creator:id,name')
            ->orderBy('priority', 'desc')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();

        return response()->json([
            'success' => true,
            'data' => AnnouncementResource::collection($announcements)
        ]);
    }

    /**
     * الحصول على إحصائيات الإعلانات
     */
    public function stats(): JsonResponse
    {
        $stats = [
            'total' => Announcement::visible()->count(),
            'by_type' => [
                'info' => Announcement::visible()->byType('info')->count(),
                'warning' => Announcement::visible()->byType('warning')->count(),
                'success' => Announcement::visible()->byType('success')->count(),
                'error' => Announcement::visible()->byType('error')->count(),
            ],
            'by_priority' => [
                'high' => Announcement::visible()->byPriority('high')->count(),
                'medium' => Announcement::visible()->byPriority('medium')->count(),
                'low' => Announcement::visible()->byPriority('low')->count(),
            ]
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
} 