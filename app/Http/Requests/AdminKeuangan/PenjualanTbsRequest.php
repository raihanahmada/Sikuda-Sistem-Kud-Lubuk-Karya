<?php
namespace App\Http\Requests\AdminKeuangan;

use Illuminate\Foundation\Http\FormRequest;

class PenjualanTbsRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'id_anggota'      => ['required', 'exists:tb_anggota,id_anggota'],
            'berat_bersih_kg' => ['required', 'numeric', 'min:0.01'],
            'tanggal_timbang' => ['required', 'date'],
        ];
    }

    public function messages(): array
    {
        return [
            'id_anggota.required'      => 'Pilih anggota terlebih dahulu',
            'id_anggota.exists'        => 'Data anggota tidak ditemukan dalam sistem',
            'berat_bersih_kg.required' => 'Masukkan berat yang valid',
            'berat_bersih_kg.min'      => 'Berat harus lebih dari 0',
        ];
    }
}
