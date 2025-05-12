<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use App\Http\Resources\CategoryResource;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Http\Requests\CategoryRequest;

class CategoryCrudController extends Controller
{
    public function index() { return CategoryResource::collection(Category::all()); }
    public function store(CategoryRequest $request) {
        $validated = $request->validated();
        $cat = Category::create($validated);
        return new CategoryResource($cat);
    }
    public function update(CategoryRequest $request, $id) {
        $cat = Category::findOrFail($id);
        $cat->update($request->validated());
        return new CategoryResource($cat);
    }
    public function destroy($id) {
        $cat = Category::findOrFail($id);
        $cat->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
