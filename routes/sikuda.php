<?php

use App\Http\Controllers\Auth\SikudaLoginController;
use App\Http\Controllers\AdminAnggota\PendaftaranController;
use App\Http\Controllers\AdminAnggota\VerifikasiController;
use App\Http\Controllers\AdminAnggota\DataAnggotaController;
use App\Http\Controllers\AdminAnggota\SimpananController;
use App\Http\Controllers\AdminAnggota\TrackingController; 
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Models\Anggota;

// ═══════════════════════════════════════════════════════════
//  SIKUDA — Routes
// ═══════════════════════════════════════════════════════════

// ── Auth (publik, tidak perlu login) ────────────────────────
Route::middleware('guest:sikuda')->group(function () {
    Route::get('/sikuda/login', [SikudaLoginController::class, 'create'])->name('sikuda.login');
    Route::post('/sikuda/login', [SikudaLoginController::class, 'store'])->name('sikuda.login.post');
});

// Logout (perlu sudah login)
Route::post('/sikuda/logout', [SikudaLoginController::class, 'destroy'])
    ->middleware('sikuda.auth')
    ->name('sikuda.logout');


// ═══════════════════════════════════════════════════════════
//  ADMIN ANGGOTA
//  Akses: role = admin_anggota
// ═══════════════════════════════════════════════════════════
Route::middleware(['sikuda.auth', 'sikuda.role:admin_anggota'])
    ->prefix('admin-anggota')
    ->name('admin-anggota.')
    ->group(function () {
        
        // Dashboard
        Route::get('/dashboard', function () {
            return inertia('AdminAnggota/Dashboard');
        })->name('dashboard');

        // =========================
        // PENDAFTARAN ANGGOTA
        // =========================
        Route::get('/pendaftaran-anggota', [PendaftaranController::class, 'index'])->name('pendaftaran-anggota.index');
        Route::get('/pendaftaran-anggota/create', [PendaftaranController::class, 'create'])->name('pendaftaran-anggota.create');
        Route::post('/pendaftaran-anggota', [PendaftaranController::class, 'store'])->name('pendaftaran-anggota.store');
        Route::get('/pendaftaran-anggota/{id}', [PendaftaranController::class, 'show'])->name('pendaftaran-anggota.show');
        Route::get('/pendaftaran-anggota/{id}/edit', [PendaftaranController::class, 'edit'])->name('pendaftaran-anggota.edit');
        Route::put('/pendaftaran-anggota/{id}', [PendaftaranController::class, 'update'])->name('pendaftaran-anggota.update');

        // =========================
        // ANTRIAN VERIFIKASI
        // =========================
        Route::get('/verifikasi', [VerifikasiController::class, 'index'])->name('verifikasi.index');
        Route::get('/verifikasi/{id}', [VerifikasiController::class, 'show'])->name('verifikasi.show');
        Route::put('/verifikasi/{id}/terima', [VerifikasiController::class, 'terima'])->name('verifikasi.terima');
        Route::put('/verifikasi/{id}/tolak', [VerifikasiController::class, 'tolak'])->name('verifikasi.tolak');
        
        // =========================
        // SIMPANAN ANGGOTA (Semua diarahkan ke SimpananController)
        // =========================
        Route::get('/simpanan', [SimpananController::class, 'index'])->name('simpanan.index');
        Route::get('/simpanan/create', [SimpananController::class, 'create'])->name('simpanan.create');
        Route::post('/simpanan', [SimpananController::class, 'store'])->name('simpanan.store');
        Route::get('/simpanan/{id}', [SimpananController::class, 'show'])->name('simpanan.show');
        Route::get('/simpanan/{id}/edit', [SimpananController::class, 'edit'])->name('simpanan.edit');
        Route::put('/simpanan/{id}', [SimpananController::class, 'update'])->name('simpanan.update');

        // =========================
        // TRACKING AKTIVITAS
        // =========================
        Route::get('/tracking', [TrackingController::class, 'index'])->name('tracking.index');
        Route::get('/tracking/{id}', [TrackingController::class, 'show'])->name('tracking.show');
        
        // =========================
        // DATA ANGGOTA
        // =========================
        Route::get('/data-anggota', [DataAnggotaController::class, 'index'])->name('data-anggota.index');
        Route::get('/data-anggota/{id}/edit', [DataAnggotaController::class, 'edit'])->name('data-anggota.edit');
        Route::put('/data-anggota/{id}', [DataAnggotaController::class, 'update'])->name('data-anggota.update');
        Route::delete('/data-anggota/{id}', [DataAnggotaController::class, 'destroy'])->name('data-anggota.destroy');

        // PENGATURAN
        Route::get('/pengaturan', function () {
            return inertia('AdminAnggota/Pengaturan/Index');
        })->name('pengaturan.index');

    });


// ═══════════════════════════════════════════════════════════
//  ADMIN KEUANGAN
//  Akses: role = admin_keuangan
// ═══════════════════════════════════════════════════════════
Route::middleware(['sikuda.auth', 'sikuda.role:admin_keuangan'])
    ->prefix('admin-keuangan')
    ->name('admin-keuangan.')
    ->group(function () {
        Route::get('/dashboard', function () {
            return inertia('AdminKeuangan/Dashboard');
        })->name('dashboard');
    });


// ═══════════════════════════════════════════════════════════
//  PEMILIK
//  Akses: role = pemilik
// ═══════════════════════════════════════════════════════════
Route::middleware(['sikuda.auth', 'sikuda.role:pemilik'])
    ->prefix('pemilik')
    ->name('pemilik.')
    ->group(function () {
        Route::get('/dashboard', function () {
            return inertia('Pemilik/Dashboard');
        })->name('dashboard');
    });


// ═══════════════════════════════════════════════════════════
//  SHARED
// ═══════════════════════════════════════════════════════════
Route::middleware(['sikuda.auth', 'sikuda.role:admin_keuangan,pemilik'])
    ->prefix('shared')
    ->name('shared.')
    ->group(function () {
        // Shared routes
    });