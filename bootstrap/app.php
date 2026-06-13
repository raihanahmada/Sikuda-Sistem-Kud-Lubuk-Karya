<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',        // bawaan Breeze
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',

        // ── Tambahkan baris ini ──────────────────────────
        then: function () {
            \Illuminate\Support\Facades\Route::middleware('web')
                ->group(base_path('routes/sikuda.php'));
        },
    )
    ->withMiddleware(function (Middleware $middleware) {

        // Middleware bawaan Inertia — jangan dihapus
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        // ── Daftarkan alias middleware SIKUDA ────────────
        $middleware->alias([
            'sikuda.auth' => \App\Http\Middleware\SikudaAuth::class,
            'sikuda.role' => \App\Http\Middleware\RoleMiddleware::class,
        ]);

        // ── 1. Aturan jika BELUM LOGIN (Guest) ───────────
// ── 1. Aturan jika BELUM LOGIN (Guest) ───────────
        $middleware->redirectGuestsTo(function (Request $request) {
            // Jika sedang mengakses rute SIKUDA, lempar ke form login SIKUDA
            if ($request->is('sikuda/*') || $request->is('admin-*') || $request->is('pemilik/*')) {
                return route('sikuda.login');
            }
            // Jika bukan rute SIKUDA, biarkan dilempar ke login Breeze
            return route('login');
        });

        // ── 2. Aturan jika SUDAH LOGIN (Authenticated) ───
        $middleware->redirectUsersTo(function (Request $request) {
            // Jika user SIKUDA yang nyangkut, lempar kembali ke dashboard masing-masing
            if (\Illuminate\Support\Facades\Auth::guard('sikuda')->check()) {
                $role = \Illuminate\Support\Facades\Auth::guard('sikuda')->user()->role;

                return match ($role) {
                    'admin_anggota'  => route('admin-anggota.dashboard'),
                    'admin_keuangan' => route('admin-keuangan.dashboard'),
                    'pemilik'        => route('pemilik.dashboard'),
                    default          => route('sikuda.login'),
                };
            }

            // Default fallback untuk user biasa Breeze
            return '/dashboard';
        });
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
