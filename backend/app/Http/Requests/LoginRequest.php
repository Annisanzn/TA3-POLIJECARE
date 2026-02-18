<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Contracts\Validation\Validator;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'email' => 'required|email',
            'password' => 'required|min:8',
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'email.required' => 'Email wajib diisi',
            'email.email' => 'Format email tidak valid',
            'password.required' => 'Password wajib diisi',
            'password.min' => 'Password minimal 8 karakter',
        ];
    }

    /**
     * Configure the validator instance.
     *
     * @param  \Illuminate\Validation\Validator  $validator
     * @return void
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function ($validator) {
            $email = $this->input('email');
            
            // Custom validation: email must contain polije.ac.id or student.polije.ac.id
            if ($email && !$this->isValidPolijeEmail($email)) {
                $validator->errors()->add('email', 'Gunakan email resmi Polije (@polije.ac.id atau @student.polije.ac.id)');
            }
        });
    }
    
    /**
     * Check if email has valid Polije domain
     */
    private function isValidPolijeEmail(string $email): bool
    {
        $allowedDomains = ['@polije.ac.id', '@student.polije.ac.id'];
        
        foreach ($allowedDomains as $domain) {
            if (str_ends_with($email, $domain)) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'email' => 'Email',
            'password' => 'Password',
        ];
    }
}
