<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use App\Http\Resources\OrderResource;
use App\Http\Requests\OrderRequest;

class OrderCrudController extends Controller
{
    public function index()
    {
        return OrderResource::collection(Order::with(['user', 'seller', 'items'])->get());
    }
    public function store(OrderRequest $request)
    {
        $validated = $request->validated();
        $order = Order::create($validated);
        $order->load(['user', 'seller', 'items']);
        return new OrderResource($order);
    }
    public function update(OrderRequest $request, $id)
    {
        $order = Order::findOrFail($id);
        $order->update($request->validated());
        $order->load(['user', 'seller', 'items']);
        return new OrderResource($order);
    }
    public function destroy($id)
    {
        $order = Order::findOrFail($id);
        $order->delete();
        return response()->json(['message' => 'Deleted']);
    }
    public function show($id)
    {
        $order = Order::with(['user', 'seller', 'items'])->findOrFail($id);
        return new OrderResource($order);
    }
}
