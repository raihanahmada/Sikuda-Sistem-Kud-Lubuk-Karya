<?php

namespace App\Http\Controllers\AdminAnggota;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class PengaturanController extends Controller
{
    public function index()
    {
        // Ambil data pengaturan admin yang sedang login
        $pengaturan = DB::table('tb_pengaturan_admin')
            ->where('username', Auth::guard('sikuda')->user()->nama_pengguna)
            ->first();

        return Inertia::render('AdminAnggota/Pengaturan/Index', [
            'pengaturan' => $pengaturan,
            'user'       => Auth::guard('sikuda')->user(),
        ]);
    }

    public function updateProfil(Request $request)
    {
        $user = Auth::guard('sikuda')->user();

        $request->validate([
            'nama_admin'  => 'required|string|max:100',
            'email'       => 'required|email|max:100',
            'no_telepon'  => 'nullable|string|max:15',
        ]);

        DB::table('tb_pengaturan_admin')
            ->where('username', $user->nama_pengguna)
            ->update([
                'nama_admin'  => $request->nama_admin,
                'email'       => $request->email,
                'no_telepon'  => $request->no_telepon,
            ]);

        return back()->with('success', 'Profil berhasil diperbarui.');
    }

    public function updatePassword(Request $request)
    {
        $user = Auth::guard('sikuda')->user();

        $request->validate([
            'password_lama'       => 'required|string',
            'password_baru'       => 'required|string|min:8',
            'konfirmasi_password' => 'required|same:password_baru',
        ], [
            'password_baru.min'        => 'Password baru minimal 8 karakter.',
            'konfirmasi_password.same' => 'Konfirmasi password tidak sesuai.',
        ]);

        // Cek password lama dari tb_pengguna
        $userDb = DB::table('tb_pengguna')
            ->where('id_pengguna', $user->id_pengguna)
            ->first();

        if (!$userDb || !Hash::check($request->password_lama, $userDb->kata_sandi)) {
            return back()->withErrors(['password_lama' => 'Password lama tidak sesuai.']);
        }

        DB::table('tb_pengguna')
            ->where('id_pengguna', $user->id_pengguna)
            ->update(['kata_sandi' => Hash::make($request->password_baru)]);

        return back()->with('success', 'Password berhasil diperbarui.');
    }
}