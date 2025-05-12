<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class OrderRequest extends FormRequest
{
    public function authorize() { return true; }

    public function rules()
    {
        if ($this->isMethod('post')) {
            return [
                'user_id' => 'required|exists:users,id',
                'seller_id' => 'required|exists:sellers,id',
                'status' => 'in:pending,paid,in_progress,completed,cancelled,refunded',
                'total_price' => 'required|numeric',
                'order_date' => 'required|date',
                'delivery_date' => 'nullable|date',
                'requirements' => 'nullable|string',
            ];
        }
        // PATCH/PUT (update)
        return [
            'status' => 'in:pending,paid,in_progress,completed,cancelled,refunded',
            'total_price' => 'sometimes|required|numeric',
            'order_date' => 'sometimes|required|date',
            'delivery_date' => 'nullable|date',
            'requirements' => 'nullable|string',
        ];
    }
}
