<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Seller;
use Illuminate\Http\Request;
use App\Http\Resources\SellerResource;
use App\Http\Requests\StoreSellerRequest;
use App\Http\Requests\UpdateSellerRequest;

class SellerCrudController extends Controller
{
    public function index() { 
        return SellerResource::collection(Seller::with(['user', 'skills'])->get()); 
    }
    public function store(StoreSellerRequest $request) {
        $validated = $request->validated();
        $seller = Seller::create($validated);
        $seller->load(['user', 'skills']);
        return new SellerResource($seller);
    }
    public function update(UpdateSellerRequest $request, $id) {
        $seller = Seller::findOrFail($id);
        $seller->update($request->validated());
        $seller->load(['user', 'skills']);
        return new SellerResource($seller);
    }
    public function destroy($id) {
        $seller = Seller::findOrFail($id);
        $seller->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
