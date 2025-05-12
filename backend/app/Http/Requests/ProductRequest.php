<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProductRequest extends FormRequest
{
    public function authorize() { return true; }

    public function rules()
    {
        if ($this->isMethod('post')) {
            return [
                'seller_id' => 'required|exists:sellers,id',
                'title' => 'required|string|max:255',
                'description' => 'required|string',
                'price' => 'required|numeric',
                'category_id' => 'required|exists:categories,id',
                'delivery_time' => 'nullable|string',
                'featured' => 'boolean',
                'status' => 'in:active,inactive,pending_review,rejected',
            ];
        }
        // PATCH/PUT (update)
        return [
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'price' => 'sometimes|required|numeric',
            'category_id' => 'sometimes|required|exists:categories,id',
            'delivery_time' => 'nullable|string',
            'featured' => 'boolean',
            'status' => 'in:active,inactive,pending_review,rejected',
        ];
    }
}
