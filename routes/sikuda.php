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
use App\Http\Controllers\AdminAnggota\PendaftaranController;
use App\Http\Controllers\AdminAnggota\VerifikasiController;
use App\Http\Controllers\AdminAnggota\DataAnggotaController;
use App\Http\Controllers\AdminAnggota\SimpananController;
use App\Http\Controllers\AdminAnggota\TrackingController;
use App\Http\Controllers\Pemilik\DashboardController;
use App\Http\Controllers\Pemilik\AnggotaController;
use App\Http\Controllers\Pemilik\LaporanPeriodikController;
use App\Http\Controllers\Pemilik\PengaturanController;
use App\Http\Controllers\Pemilik\SimpananController as PemilikSimpananController;
use App\Http\Controllers\Pemilik\KasController;
use Illuminate\Support\Facades\Route;
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
        // SIMPANAN ANGGOTA
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

    }); // 🔹 SEKARANG SUDAH DITUTUP DI SINI

// ═══════════════════════════════════════════════════════════
//  PEMILIK
//  Akses: role = pemilik
// ═══════════════════════════════════════════════════════════
Route::middleware(['sikuda.auth', 'sikuda.role:pemilik'])
    ->prefix('pemilik')
    ->name('pemilik.')
    ->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
        Route::get('/anggota', [AnggotaController::class, 'index'])->name('anggota');
        Route::get('/laporan-periodik', [LaporanPeriodikController::class, 'index'])->name('laporan.periodik');
        Route::get('/pengaturan', function () {
            return inertia('Pemilik/Pengaturan');
        })->name('pengaturan');
        Route::post('/pengaturan/update', [PengaturanController::class, 'update'])->name('pengaturan.update');
        Route::get('/simpanan', [PemilikSimpananController::class, 'index'])->name('simpanan');
        Route::get('/kas', [KasController::class, 'index'])->name('kas');
    });

// ═══════════════════════════════════════════════════════════
//  SHARED
// ═══════════════════════════════════════════════════════════
Route::middleware(['sikuda.auth', 'sikuda.role:admin_keuangan,pemilik'])
    ->prefix('shared')
    ->name('shared.')
    ->group(function () {
        // Shared routes
    }); // 🔹 DITUTUP DENGAN BENAR (TIDAK ADA DOUBLE PENUTUP LAGI)
