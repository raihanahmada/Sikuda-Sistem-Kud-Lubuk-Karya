<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware pengecekan sesi login SIKUDA.
 * Terpisah dari middleware 'auth' bawaan Breeze yang pakai guard 'web'.
 *
 * Penggunaan di route:
 *   ->middleware('sikuda.auth')
 */
class SikudaAuth
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! Auth::guard('sikuda')->check()) {
            return redirect()->route('sikuda.login');
        }

        return $next($request);
    }
}
