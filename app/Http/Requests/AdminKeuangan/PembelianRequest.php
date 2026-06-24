<?php
namespace App\Http\Requests\AdminKeuangan;

use Illuminate\Foundation\Http\FormRequest;

class PembelianRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'id_anggota'        => ['required', 'exists:tb_anggota,id_anggota'],
            'id_barang'         => ['required', 'exists:tb_barang,id_barang'],
            'jumlah'            => ['required', 'numeric', 'min:0.01'],
            'tanggal_pembelian' => ['required', 'date'],
            'keterangan'        => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'id_anggota.required' => 'Pilih anggota terlebih dahulu',
            'id_anggota.exists'   => 'Data anggota tidak ditemukan dalam sistem',
            'id_barang.required'  => 'Pilih barang terlebih dahulu',
            'jumlah.required'     => 'Masukkan jumlah yang valid',
            'jumlah.numeric'      => 'Masukkan jumlah yang valid',
            'jumlah.min'          => 'Jumlah harus lebih dari 0',
        ];
    }
}
