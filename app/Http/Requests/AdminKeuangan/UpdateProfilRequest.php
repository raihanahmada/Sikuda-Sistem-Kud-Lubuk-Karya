<?php
namespace App\Http\Requests\AdminKeuangan;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProfilRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'nama_pengguna' => [
                'required', 'string', 'max:50',
                Rule::unique('tb_pengguna', 'nama_pengguna')
                    ->ignore($this->user('sikuda')->id_pengguna, 'id_pengguna'),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'nama_pengguna.required' => 'Nama pengguna tidak boleh kosong',
            'nama_pengguna.unique'   => 'Nama pengguna sudah dipakai',
        ];
    }
}
