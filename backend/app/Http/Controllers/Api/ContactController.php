<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ContactController extends Controller
{
    /**
     * Submit a contact us message (public endpoint)
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'subject' => 'nullable|string|max:500',
            'message' => 'required|string|max:5000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'بيانات غير صحيحة',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $contactMessage = ContactMessage::create([
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
                'subject' => $request->subject,
                'message' => $request->message,
            ]);

            return response()->json([
                'message' => 'تم إرسال رسالتك بنجاح، سنتواصل معك قريباً',
                'data' => $contactMessage
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'حدث خطأ أثناء إرسال الرسالة، الرجاء المحاولة مرة أخرى',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all contact messages for admin (protected endpoint)
     */
    public function index(Request $request)
    {
        // Check if user is admin
        if (!auth()->user() || auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'غير مصرح لك بالوصول'], 403);
        }

        try {
            $query = ContactMessage::with('resolvedBy:id,name');

            // Apply filters
            if ($request->has('status')) {
                switch ($request->status) {
                    case 'unread':
                        $query->unread();
                        break;
                    case 'unresolved':
                        $query->unresolved();
                        break;
                    case 'resolved':
                        $query->resolved();
                        break;
                }
            }

            // Apply search
            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('subject', 'like', "%{$search}%")
                      ->orWhere('message', 'like', "%{$search}%");
                });
            }

            // Pagination
            $perPage = $request->get('per_page', 10);
            $messages = $query->orderBy('created_at', 'desc')->paginate($perPage);

            return response()->json([
                'message' => 'تم تحميل الرسائل بنجاح',
                'data' => $messages
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'حدث خطأ أثناء تحميل الرسائل',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get contact message statistics for admin
     */
    public function stats()
    {
        // Check if user is admin
        if (!auth()->user() || auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'غير مصرح لك بالوصول'], 403);
        }

        try {
            $stats = [
                'total' => ContactMessage::count(),
                'unread' => ContactMessage::unread()->count(),
                'unresolved' => ContactMessage::unresolved()->count(),
                'resolved' => ContactMessage::resolved()->count(),
                'today' => ContactMessage::whereDate('created_at', today())->count(),
                'this_week' => ContactMessage::whereBetween('created_at', [
                    now()->startOfWeek(), 
                    now()->endOfWeek()
                ])->count(),
            ];

            return response()->json([
                'message' => 'تم تحميل الإحصائيات بنجاح',
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'حدث خطأ أثناء تحميل الإحصائيات',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark message as read
     */
    public function markAsRead(Request $request, $id)
    {
        // Check if user is admin
        if (!auth()->user() || auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'غير مصرح لك بالوصول'], 403);
        }

        try {
            $message = ContactMessage::findOrFail($id);
            $message->markAsRead();

            return response()->json([
                'message' => 'تم تعليم الرسالة كمقروءة',
                'data' => $message->fresh()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'حدث خطأ أثناء تحديث الرسالة',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark message as resolved
     */
    public function markAsResolved(Request $request, $id)
    {
        // Check if user is admin
        if (!auth()->user() || auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'غير مصرح لك بالوصول'], 403);
        }

        $validator = Validator::make($request->all(), [
            'admin_notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'بيانات غير صحيحة',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $message = ContactMessage::findOrFail($id);
            $message->markAsResolved(auth()->user()->id, $request->admin_notes);

            return response()->json([
                'message' => 'تم تعليم الرسالة كمحلولة',
                'data' => $message->fresh(['resolvedBy'])
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'حدث خطأ أثناء تحديث الرسالة',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get single contact message details
     */
    public function show($id)
    {
        // Check if user is admin
        if (!auth()->user() || auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'غير مصرح لك بالوصول'], 403);
        }

        try {
            $message = ContactMessage::with('resolvedBy:id,name')->findOrFail($id);
            
            // Mark as read when viewed
            if (!$message->is_read) {
                $message->markAsRead();
            }

            return response()->json([
                'message' => 'تم تحميل تفاصيل الرسالة بنجاح',
                'data' => $message->fresh()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'حدث خطأ أثناء تحميل الرسالة',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a contact message
     */
    public function destroy($id)
    {
        // Check if user is admin
        if (!auth()->user() || auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'غير مصرح لك بالوصول'], 403);
        }

        try {
            $message = ContactMessage::findOrFail($id);
            $message->delete();

            return response()->json([
                'message' => 'تم حذف الرسالة بنجاح'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'حدث خطأ أثناء حذف الرسالة',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 