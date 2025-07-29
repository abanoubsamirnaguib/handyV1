<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use App\Http\Resources\CategoryResource;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Http\Requests\CategoryRequest;
use Illuminate\Support\Facades\Storage;

class CategoryCrudController extends Controller
{
    public function index() { return CategoryResource::collection(Category::all()); }
    public function store(CategoryRequest $request) {
        $validated = $request->validated();
        
        // Handle image upload
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('categories', 'public');
            $validated['image'] = $imagePath;
        }
        
        $cat = Category::create($validated);
        return new CategoryResource($cat);
    }
    public function update(CategoryRequest $request, $id) {
        $cat = Category::findOrFail($id);
        $validated = $request->validated();
        
        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($cat->image) {
                Storage::disk('public')->delete($cat->image);
            }
            $imagePath = $request->file('image')->store('categories', 'public');
            $validated['image'] = $imagePath;
        } elseif ($request->has('remove_image') && $request->input('remove_image') === '1') {
            // Remove existing image
            if ($cat->image) {
                Storage::disk('public')->delete($cat->image);
            }
            $validated['image'] = null;
        }
        
        $cat->update($validated);
        return new CategoryResource($cat);
    }
    public function destroy($id) {
        $cat = Category::findOrFail($id);
        
        // Delete image if exists
        if ($cat->image) {
            Storage::disk('public')->delete($cat->image);
        }
        
        $cat->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
