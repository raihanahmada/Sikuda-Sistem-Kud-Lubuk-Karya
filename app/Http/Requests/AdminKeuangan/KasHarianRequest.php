<?php
namespace App\Http\Requests\AdminKeuangan;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class KasHarianRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'jenis_kas'         => ['required', Rule::in(['masuk', 'keluar'])],
            'nominal'           => ['required', 'numeric', 'min:1'],
            'keterangan'        => ['required', 'string', 'max:1000'],
            'tanggal_transaksi' => ['required', 'date'],
        ];
    }

    // Pesan sesuai alur pengecualian UC07
    public function messages(): array
    {
        return [
            'jenis_kas.required'         => 'Pilih jenis kas terlebih dahulu',
            'nominal.required'           => 'Masukkan nominal yang valid',
            'nominal.numeric'            => 'Masukkan nominal yang valid',
            'nominal.min'                => 'Nominal harus lebih dari 0',
            'keterangan.required'        => 'Keterangan transaksi tidak boleh kosong',
            'tanggal_transaksi.required' => 'Tanggal transaksi wajib diisi',
        ];
    }
}
