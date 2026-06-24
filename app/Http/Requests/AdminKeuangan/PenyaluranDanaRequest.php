<?php
namespace App\Http\Requests\AdminKeuangan;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PenyaluranDanaRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'id_penjualan' => [
                'required', 'exists:tb_penjualan_tbs,id_penjualan',
                // satu penjualan hanya boleh disalurkan sekali (abaikan diri sendiri saat edit)
                Rule::unique('tb_penyaluran_dana', 'id_penjualan')
                    ->ignore($this->route('id'), 'id_penyaluran'),
            ],
            'total_potongan'     => ['required', 'numeric', 'min:0'],
            'tanggal_penyaluran' => ['required', 'date'],
            'keterangan'         => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'id_penjualan.required' => 'Pilih penjualan TBS yang akan disalurkan',
            'id_penjualan.exists'   => 'Data penjualan TBS tidak ditemukan',
            'id_penjualan.unique'   => 'Penjualan TBS ini sudah pernah disalurkan',
            'total_potongan.required' => 'Masukkan total potongan biaya kebun',
            'total_potongan.numeric'  => 'Potongan harus berupa angka',
            'total_potongan.min'      => 'Potongan tidak boleh negatif',
        ];
    }
}
