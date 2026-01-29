<?php

namespace App\Http\Controllers;

use App\Models\GiftSection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class GiftSectionController extends Controller
{
    /**
     * Get all gift sections with their products (for public display)
     */
    public function index()
    {
        try {
            $sections = GiftSection::where('is_active', true)
                ->orderBy('display_order', 'asc')
                ->get();

            $sectionsWithProducts = $sections->map(function ($section) {
                return [
                    'id' => $section->id,
                    'title' => $section->title,
                    'tags' => $section->tags,
                    'products' => $section->getProducts(20), // Limit to 20 products per section
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $sectionsWithProducts
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch gift sections',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all gift sections for admin (including inactive)
     */
    public function adminIndex()
    {
        try {
            $sections = GiftSection::orderBy('display_order', 'asc')->get();

            return response()->json([
                'success' => true,
                'data' => $sections
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch gift sections',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get single gift section
     */
    public function show($id)
    {
        try {
            $section = GiftSection::findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => [
                    'section' => $section,
                    'products' => $section->getProducts()
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Section not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Create new gift section
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'tags' => 'required|array|min:1',
            'tags.*' => 'required|string',
            'display_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $section = GiftSection::create([
                'title' => $request->title,
                'tags' => $request->tags,
                'display_order' => $request->display_order ?? 0,
                'is_active' => $request->is_active ?? true,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Gift section created successfully',
                'data' => $section
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create gift section',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update gift section
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'tags' => 'sometimes|required|array|min:1',
            'tags.*' => 'required|string',
            'display_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $section = GiftSection::findOrFail($id);
            
            $section->update($request->only([
                'title',
                'tags',
                'display_order',
                'is_active'
            ]));

            return response()->json([
                'success' => true,
                'message' => 'Gift section updated successfully',
                'data' => $section
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update gift section',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete gift section
     */
    public function destroy($id)
    {
        try {
            $section = GiftSection::findOrFail($id);
            $section->delete();

            return response()->json([
                'success' => true,
                'message' => 'Gift section deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete gift section',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update display order
     */
    public function updateOrder(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'sections' => 'required|array',
            'sections.*.id' => 'required|exists:gift_sections,id',
            'sections.*.display_order' => 'required|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            foreach ($request->sections as $sectionData) {
                GiftSection::where('id', $sectionData['id'])
                    ->update(['display_order' => $sectionData['display_order']]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Display order updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update display order',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
