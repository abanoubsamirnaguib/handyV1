<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HomeSlider;
use App\Services\ImageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class AdminHomeSliderController extends Controller
{
    public function index(): JsonResponse
    {
        try {
            $slides = HomeSlider::query()
                ->orderBy('display_order', 'asc')
                ->orderBy('id', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $slides,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch home slider',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'media_type' => 'required|in:image,video',
            'media' => 'required|file|max:5120', // 5MB
            'target_url' => ['nullable', 'string', 'max:2048', 'regex:/^(\/|https?:\/\/)/i'],
            'display_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $data = $validator->validated();

            if (!$request->hasFile('media')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Media file is required',
                ], 422);
            }

            $file = $request->file('media');
            $mediaType = $data['media_type'];

            if ($mediaType === 'image') {
                $mime = $file->getMimeType();
                if (!in_array($mime, ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'], true)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Invalid image type',
                    ], 422);
                }

                $path = ImageService::convertToWebP(
                    $file,
                    'home_sliders/images',
                    100,
                    85,
                    40,
                    5,
                    0,
                    5120
                );
            } else {
                $ext = strtolower($file->getClientOriginalExtension() ?: 'mp4');
                if (!in_array($ext, ['mp4', 'webm', 'ogg'], true)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Invalid video type',
                    ], 422);
                }

                $filename = Str::uuid() . '.' . $ext;
                $path = $file->storeAs('home_sliders/videos', $filename, 'public');
            }

            $slide = HomeSlider::create([
                'media_type' => $mediaType,
                'media_path' => $path,
                'target_url' => $data['target_url'] ?? null,
                'display_order' => $data['display_order'] ?? 0,
                'is_active' => $request->has('is_active') ? $request->boolean('is_active') : true,
            ]);

            Cache::forget('home_slider_list');

            return response()->json([
                'success' => true,
                'message' => 'Slide created successfully',
                'data' => $slide,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create slide',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function update(Request $request, $id): JsonResponse
    {
        $slide = HomeSlider::find($id);

        if (!$slide) {
            return response()->json([
                'success' => false,
                'message' => 'Slide not found',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'media_type' => 'sometimes|required|in:image,video',
            'media' => 'sometimes|file|max:5120', // 5MB
            'target_url' => ['nullable', 'string', 'max:2048', 'regex:/^(\/|https?:\/\/)/i'],
            'display_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $data = $validator->validated();

            $mediaType = $data['media_type'] ?? $slide->media_type;
            $newPath = null;

            if (
                array_key_exists('media_type', $data)
                && $mediaType !== $slide->media_type
                && !$request->hasFile('media')
            ) {
                return response()->json([
                    'success' => false,
                    'message' => 'Changing media type requires uploading a new media file',
                ], 422);
            }

            if ($request->hasFile('media')) {
                $file = $request->file('media');

                if ($mediaType === 'image') {
                    $mime = $file->getMimeType();
                    if (!in_array($mime, ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'], true)) {
                        return response()->json([
                            'success' => false,
                            'message' => 'Invalid image type',
                        ], 422);
                    }

                    $newPath = ImageService::convertToWebP(
                        $file,
                        'home_sliders/images',
                        100,
                        85,
                        40,
                        5,
                        0,
                        5120
                    );
                } else {
                    $ext = strtolower($file->getClientOriginalExtension() ?: 'mp4');
                    if (!in_array($ext, ['mp4', 'webm', 'ogg'], true)) {
                        return response()->json([
                            'success' => false,
                            'message' => 'Invalid video type',
                        ], 422);
                    }

                    $filename = Str::uuid() . '.' . $ext;
                    $newPath = $file->storeAs('home_sliders/videos', $filename, 'public');
                }

                // Delete old file (only if stored on public disk)
                if ($slide->media_path && !str_starts_with($slide->media_path, 'http')) {
                    Storage::disk('public')->delete($slide->media_path);
                }
            }

            $slide->update([
                'media_type' => $mediaType,
                'media_path' => $newPath ?? $slide->media_path,
                'target_url' => array_key_exists('target_url', $data) ? ($data['target_url'] ?: null) : $slide->target_url,
                'display_order' => array_key_exists('display_order', $data) ? ($data['display_order'] ?? 0) : $slide->display_order,
                'is_active' => array_key_exists('is_active', $data) ? $request->boolean('is_active') : $slide->is_active,
            ]);

            Cache::forget('home_slider_list');

            return response()->json([
                'success' => true,
                'message' => 'Slide updated successfully',
                'data' => $slide->fresh(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update slide',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function destroy($id): JsonResponse
    {
        $slide = HomeSlider::find($id);

        if (!$slide) {
            return response()->json([
                'success' => false,
                'message' => 'Slide not found',
            ], 404);
        }

        try {
            if ($slide->media_path && !str_starts_with($slide->media_path, 'http')) {
                Storage::disk('public')->delete($slide->media_path);
            }

            $slide->delete();

            Cache::forget('home_slider_list');

            return response()->json([
                'success' => true,
                'message' => 'Slide deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete slide',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function updateOrder(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'slides' => 'required|array',
            'slides.*.id' => 'required|exists:home_sliders,id',
            'slides.*.display_order' => 'required|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            foreach ($request->slides as $row) {
                HomeSlider::where('id', $row['id'])->update([
                    'display_order' => $row['display_order'],
                ]);
            }

            Cache::forget('home_slider_list');

            return response()->json([
                'success' => true,
                'message' => 'Order updated successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update order',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
