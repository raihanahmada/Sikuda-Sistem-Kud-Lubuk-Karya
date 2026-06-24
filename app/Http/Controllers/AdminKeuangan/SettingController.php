<?php
namespace App\Http\Controllers\AdminKeuangan;

use App\Http\Controllers\Controller;
use App\Http\Requests\AdminKeuangan\UpdatePasswordRequest;
use App\Http\Requests\AdminKeuangan\UpdateProfilRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class SettingController extends Controller
{
    public function index()
    {
        return Inertia::render('AdminKeuangan/Setting');
    }

    public function updateProfil(UpdateProfilRequest $request)
    {
        Auth::guard('sikuda')->user()->update($request->validated());

        return back()->with('sukses', 'Nama pengguna berhasil diperbarui.');
    }

    public function updatePassword(UpdatePasswordRequest $request)
    {
        Auth::guard('sikuda')->user()->update([
            'kata_sandi' => Hash::make($request->validated()['kata_sandi_baru']),
        ]);

        return back()->with('sukses', 'Password berhasil diperbarui.');
    }
}
