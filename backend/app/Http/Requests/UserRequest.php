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
            ];
        }
        // PATCH/PUT (update)
        return [
            'name' => 'sometimes|required|string|max:100',
            'email' => 'sometimes|required|email|unique:users,email',
            'password' => 'sometimes|required|string|min:6',
            'role' => 'in:admin,seller,buyer',
        ];
    }
}
