<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReviewRequest extends FormRequest
{
    public function authorize() { return true; }

    public function rules()
    {
        if ($this->isMethod('post')) {
            return [
                'product_id' => 'required|exists:products,id',
                'order_id' => 'nullable|exists:orders,id',
                'rating' => 'required|integer|min:1|max:5',
                'comment' => 'nullable|string',
                'status' => 'in:published,hidden,pending',
            ];
        }
        // PATCH/PUT (update)
        return [
            'rating' => 'sometimes|required|integer|min:1|max:5',
            'comment' => 'nullable|string',
            'status' => 'in:published,hidden,pending',
        ];
    }
}
