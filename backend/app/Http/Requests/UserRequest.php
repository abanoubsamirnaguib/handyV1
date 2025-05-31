<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UserRequest extends FormRequest
{
    public function authorize() { return true; }

    public function rules()
    {
        if ($this->isMethod('post')) {
            return [
                'name' => 'required|string|max:100',
                'email' => 'required|email|unique:users,email',
                'password' => 'required|string|min:6',
                'role' => 'in:admin,seller,buyer',
                'phone' => 'nullable|string|max:20',
            ];
        }        // PATCH/PUT (update)
        return [
            'name' => 'sometimes|required|string|max:100',
            'email' => 'sometimes|required|email|unique:users,email,' . $this->route('id'),
            'password' => 'sometimes|required|string|min:6',
            'role' => 'sometimes|in:admin,seller,buyer',
            'bio' => 'nullable|string',
            'location' => 'nullable|string',
            'avatar' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
            'skills' => 'nullable|array',
            'skills.*' => 'nullable|string',
        ];
    }
}
