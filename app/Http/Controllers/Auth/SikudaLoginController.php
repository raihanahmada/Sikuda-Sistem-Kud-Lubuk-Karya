<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\SikudaLoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class SikudaLoginController extends Controller
{
    // ── Tampilkan halaman login ───────────────────────────

    public function create(): Response
    {
        return Inertia::render('Auth/SikudaLogin', [
            'canResetPassword' => Route::has('password.request'),
            'status'           => session('status'),
        ]);
    }

    // ── Proses login ─────────────────────────────────────

    public function store(SikudaLoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        // Regenerate session agar aman dari session fixation
        $request->session()->regenerate();

        // Redirect sesuai role
        return $this->redirectByRole();
    }

    // ── Logout ───────────────────────────────────────────

    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('sikuda')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('sikuda.login');
    }

    // ── Private: tentukan tujuan redirect per role ────────

    private function redirectByRole(): RedirectResponse
    {
        /** @var \App\Models\Pengguna $pengguna */
        $pengguna = Auth::guard('sikuda')->user();

        return match ($pengguna->role) {
            'admin_anggota'   => redirect()->route('admin-anggota.dashboard'),
            'admin_keuangan'  => redirect()->route('admin-keuangan.dashboard'),
            'pemilik'         => redirect()->route('pemilik.dashboard'),
            default           => redirect()->route('sikuda.login')
                                           ->withErrors(['nama_pengguna' => 'Role tidak dikenali.']),
        };
    }
}
