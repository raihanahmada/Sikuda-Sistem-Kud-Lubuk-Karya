<?php

use App\Http\Controllers\AdminKeuangan\DashboardController as KeuanganDashboard;
use App\Http\Controllers\AdminKeuangan\HargaTbsController;
use App\Http\Controllers\AdminKeuangan\KasHarianController;
use App\Http\Controllers\AdminKeuangan\PembelianController;
use App\Http\Controllers\AdminKeuangan\PenjualanTbsController;
use App\Http\Controllers\AdminKeuangan\PenyaluranDanaController;
use App\Http\Controllers\AdminKeuangan\LaporanController;
use App\Http\Controllers\AdminKeuangan\SettingController;
use App\Http\Controllers\Auth\SikudaLoginController;
use Illuminate\Support\Facades\Route;
//Pemilik
use App\Http\Controllers\Pemilik\DashboardController;
use App\Http\Controllers\Pemilik\AnggotaController;
use App\Http\Controllers\Pemilik\LaporanPeriodikController;
use App\Http\Controllers\Pemilik\PengaturanController;
use App\Http\Controllers\Pemilik\SimpananController;
use App\Http\Controllers\Pemilik\KasController;
// ═══════════════════════════════════════════════════════════
//  SIKUDA — Routes (terpisah dari web.php bawaan Breeze)
//  File ini di-load dari bootstrap/app.php (Laravel 11)
//  atau dari RouteServiceProvider (Laravel 10 ke bawah)
// ═══════════════════════════════════════════════════════════


// ── Auth (publik, tidak perlu login) ────────────────────────
Route::middleware('guest:sikuda')->group(function () {

    Route::get('/sikuda/login', [SikudaLoginController::class, 'create'])
        ->name('sikuda.login');

    Route::post('/sikuda/login', [SikudaLoginController::class, 'store'])
        ->name('sikuda.login.post');
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

    });

// ═══════════════════════════════════════════════════════════
//  ADMIN KEUANGAN
//  Akses: role = admin_keuangan
// ═══════════════════════════════════════════════════════════
Route::middleware(['sikuda.auth', 'sikuda.role:admin_keuangan'])
    ->prefix('admin-keuangan')
    ->name('admin-keuangan.')
    ->group(function () {

        // Dashboard
        Route::get('/dashboard', [KeuanganDashboard::class, 'index'])->name('dashboard');

        Route::get('/kas-harian', [KasHarianController::class, 'index'])->name('kas-harian.index');
        Route::post('/kas-harian', [KasHarianController::class, 'store'])->name('kas-harian.store');
        Route::put('/kas-harian/{id}', [KasHarianController::class, 'update'])->name('kas-harian.update');
        Route::delete('/kas-harian/{id}', [KasHarianController::class, 'destroy'])->name('kas-harian.destroy');

        Route::get('/pembelian', [PembelianController::class, 'index'])->name('pembelian.index');
        Route::post('/pembelian', [PembelianController::class, 'store'])->name('pembelian.store');
        Route::put('/pembelian/{id}', [PembelianController::class, 'update'])->name('pembelian.update');
        Route::delete('/pembelian/{id}', [PembelianController::class, 'destroy'])->name('pembelian.destroy');

        Route::get('/penjualan-tbs', [PenjualanTbsController::class, 'index'])->name('penjualan-tbs.index');
        Route::post('/penjualan-tbs', [PenjualanTbsController::class, 'store'])->name('penjualan-tbs.store');
        Route::put('/penjualan-tbs/{id}', [PenjualanTbsController::class, 'update'])->name('penjualan-tbs.update');
        Route::delete('/penjualan-tbs/{id}', [PenjualanTbsController::class, 'destroy'])->name('penjualan-tbs.destroy');

        Route::get('/penyaluran-dana', [PenyaluranDanaController::class, 'index'])->name('penyaluran-dana.index');
        Route::post('/penyaluran-dana', [PenyaluranDanaController::class, 'store'])->name('penyaluran-dana.store');
        Route::put('/penyaluran-dana/{id}', [PenyaluranDanaController::class, 'update'])->name('penyaluran-dana.update');
        Route::delete('/penyaluran-dana/{id}', [PenyaluranDanaController::class, 'destroy'])->name('penyaluran-dana.destroy');

        Route::post('/harga-tbs', [HargaTbsController::class, 'store'])->name('harga-tbs.store');

        Route::get('/laporan', [LaporanController::class, 'index'])->name('laporan.index');

        Route::get('/setting', [SettingController::class, 'index'])->name('setting.index');
        Route::put('/setting/profil', [SettingController::class, 'updateProfil'])->name('setting.profil');
        Route::put('/setting/password', [SettingController::class, 'updatePassword'])->name('setting.password');
    });

// ═══════════════════════════════════════════════════════════
//  PEMILIK
//  Akses: role = pemilik
// ═══════════════════════════════════════════════════════════
Route::middleware(['sikuda.auth', 'sikuda.role:pemilik'])
    ->prefix('pemilik')
    ->name('pemilik.')
    ->group(function () {

        // Dashboard
        // Route::get('/dashboard', function () {
        //     return inertia('Pemilik/Dashboard');
        // })->name('dashboard');
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
        Route::get('/anggota', [AnggotaController::class, 'index'])->name('anggota');
        Route::get('/laporan-periodik', [LaporanPeriodikController::class, 'index'])->name('laporan.periodik');
        Route::get('/pengaturan', function () {
            return inertia('Pemilik/Pengaturan');
        })->name('pengaturan');
        Route::post('/pengaturan/update', [PengaturanController::class, 'update'])->name('pengaturan.update');
        Route::get('/simpanan', [SimpananController::class, 'index'])->name('simpanan');
        Route::get('/kas', [KasController::class, 'index'])->name('kas');
    });

// ═══════════════════════════════════════════════════════════
//  SHARED — Route yang bisa diakses oleh beberapa role
//  Tambahkan role tambahan dengan koma
//  Contoh: 'sikuda.role:admin_keuangan,pemilik'
// ═══════════════════════════════════════════════════════════
Route::middleware(['sikuda.auth', 'sikuda.role:admin_keuangan,pemilik'])
    ->prefix('shared')
    ->name('shared.')
    ->group(function () {

        // ── Isi route shared di sini ──────────────────────
        // Contoh:
        // Route::get('/laporan-keuangan', [LaporanController::class, 'index'])->name('laporan-keuangan.index');
        // ─────────────────────────────────────────────────
    });
    Route::get('/test-laporan', [App\Http\Controllers\Pemilik\LaporanPeriodikController::class, 'index']);
