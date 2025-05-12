<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSellerRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'user_id' => 'required|exists:users,id',
            'bio' => 'nullable|string',
            'location' => 'nullable|string',
            'member_since' => 'nullable|date',
            'rating' => 'nullable|numeric',
            'review_count' => 'nullable|integer',
            'completed_orders' => 'nullable|integer',
            'response_time' => 'nullable|string',
        ];
    }
}
