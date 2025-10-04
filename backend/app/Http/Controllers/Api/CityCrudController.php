<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\City;
use Illuminate\Http\Request;

class CityCrudController extends Controller
{
    public function index()
    {
        return response()->json(City::orderBy('name')->paginate(50));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'delivery_fee' => 'required|numeric|min:0',
            'platform_commission_percent' => 'required|numeric|min:0|max:100',
        ]);
        $city = City::create($data);
        return response()->json($city, 201);
    }

    public function show($id)
    {
        return response()->json(City::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $city = City::findOrFail($id);
        $data = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'delivery_fee' => 'sometimes|required|numeric|min:0',
            'platform_commission_percent' => 'sometimes|required|numeric|min:0|max:100',
        ]);
        $city->update($data);
        return response()->json($city);
    }

    public function destroy($id)
    {
        $city = City::findOrFail($id);
        $city->delete();
        return response()->json(['message' => 'deleted']);
    }
}
