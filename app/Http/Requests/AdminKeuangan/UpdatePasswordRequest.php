<?php
namespace App\Http\Requests\AdminKeuangan;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class UpdatePasswordRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'kata_sandi_lama' => ['required', 'current_password:sikuda'],
            'kata_sandi_baru' => ['required', 'confirmed', Password::defaults()],
        ];
    }

    public function messages(): array
    {
        return [
            'kata_sandi_lama.required'         => 'Password lama wajib diisi',
            'kata_sandi_lama.current_password' => 'Password lama tidak sesuai',
            'kata_sandi_baru.required'          => 'Password baru wajib diisi',
            'kata_sandi_baru.confirmed'         => 'Konfirmasi password tidak sama',
        ];
    }
}
