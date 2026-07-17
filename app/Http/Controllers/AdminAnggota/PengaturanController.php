<?php

namespace App\Http\Controllers\AdminAnggota;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class PengaturanController extends Controller
{
    public function index()
    {
        return inertia('AdminAnggota/Pengaturan/Index');
    }

    public function update(Request $request)
    {
        $user = Auth::guard('sikuda')->user();

        if (!$user) {
            return back()->withErrors(['error' => 'User tidak ditemukan.']);
        }

        // ── Ganti password ─────────────────────────────────────────
        if ($request->filled('password_lama')) {
            $request->validate([
                'password_lama'       => 'required|string',
                'password_baru'       => 'required|string|min:8',
                'konfirmasi_password' => 'required|same:password_baru',
            ], [
                'password_baru.min'        => 'Password baru minimal 8 karakter.',
                'konfirmasi_password.same' => 'Konfirmasi password tidak sesuai.',
            ]);

            // Ambil kata_sandi langsung dari DB
            $userDb = DB::table('tb_pengguna')
                ->where('id_pengguna', $user->id_pengguna)
                ->first();

            if (!$userDb || !Hash::check($request->password_lama, $userDb->kata_sandi)) {
                return back()->withErrors(['password_lama' => 'Password lama tidak sesuai.']);
            }

            DB::table('tb_pengguna')
                ->where('id_pengguna', $user->id_pengguna)
                ->update(['kata_sandi' => Hash::make($request->password_baru)]);

            return back();
        }

        // ── Update profil ──────────────────────────────────────────
        $request->validate([
            'nama_pengguna' => [
                'required', 'string', 'max:255',
                Rule::unique('tb_pengguna', 'nama_pengguna')
                    ->ignore($user->id_pengguna, 'id_pengguna'),
            ],
        ], [
            'nama_pengguna.unique' => 'Nama pengguna ini sudah dipakai.',
        ]);

        DB::table('tb_pengguna')
            ->where('id_pengguna', $user->id_pengguna)
            ->update(['nama_pengguna' => $request->nama_pengguna]);

        return back();
    }
}
