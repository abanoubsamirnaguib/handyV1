<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;
use App\Http\Resources\ReviewResource;
use App\Http\Requests\ReviewRequest;

class ReviewCrudController extends Controller
{
    public function index() { 
        return ReviewResource::collection(Review::with(['user', 'product'])->get()); 
    }
    public function store(ReviewRequest $request) {
        $validated = $request->validated();
        $review = Review::create($validated);
        $review->load(['user', 'product']);
        return new ReviewResource($review);
    }
    public function update(ReviewRequest $request, $id) {
        $review = Review::findOrFail($id);
        $review->update($request->validated());
        $review->load(['user', 'product']);
        return new ReviewResource($review);
    }
    public function destroy($id) {
        $review = Review::findOrFail($id);
        $review->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
