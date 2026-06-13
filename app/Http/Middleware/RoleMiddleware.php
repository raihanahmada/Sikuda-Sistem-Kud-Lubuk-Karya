<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        // Pastikan sudah login via guard 'sikuda'
        if (! Auth::guard('sikuda')->check()) {
            return redirect()->route('sikuda.login');
        }

        $pengguna = Auth::guard('sikuda')->user();

        // Cek apakah role pengguna termasuk dalam role yang diizinkan
        if (! in_array($pengguna->role, $roles)) {
            abort(403, 'Akses ditolak. Anda tidak memiliki hak akses ke halaman ini.');
        }

        return $next($request);
    }
}
