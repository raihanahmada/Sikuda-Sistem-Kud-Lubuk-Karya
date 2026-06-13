import React from 'react';
// 1. Import komponen Link dari Inertia
import { Head, Link } from '@inertiajs/react';

export default function Welcome() {
    return (
        <div style={{ padding: '20px' }}>
            <Head title="Halaman Utama" />
            <h1>Selamat Datang di Web Saya</h1>

            <nav style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                {/* 2. Gunakan Link untuk pindah halaman (tanpa refresh) */}
                <Link
                    href="/tentang"
                    style={{ color: 'blue', textDecoration: 'underline' }}
                >
                    Pergi ke Halaman Tentang
                </Link>

                <Link
                    href="/profil/1"
                    style={{ color: 'blue', textDecoration: 'underline' }}
                >
                    Lihat Profil ID 1
                </Link>

                {/* Alternatif: Menggunakan fungsi route() jika kamu memakai nama route (Breeze otomatis mendukung ini via Ziggy) */}
                <Link
                    href={route('login')}
                    style={{ color: 'green', textDecoration: 'underline' }}
                >
                    Halaman Login
                </Link>
            </nav>
        </div>
    );
}
