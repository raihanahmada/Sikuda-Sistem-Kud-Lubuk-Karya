<?php
namespace App\Http\Controllers\AdminKeuangan;

use App\Http\Controllers\Controller;
use App\Models\HargaTbs;
use Illuminate\Http\Request;

class HargaTbsController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'harga_per_kg'  => ['required', 'numeric', 'min:1'],
            'berlaku_mulai' => ['required', 'date'],
        ], [
            'harga_per_kg.required' => 'Masukkan harga yang valid',
            'harga_per_kg.min'      => 'Harga harus lebih dari 0',
        ]);

        HargaTbs::create([
            ...$data,
            'id_pengguna' => auth('sikuda')->id(),
        ]);

        return back()->with('sukses', 'Harga TBS berhasil diperbarui.');
    }
}
