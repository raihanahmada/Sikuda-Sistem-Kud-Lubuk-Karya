import React from 'react';
import { Head, Link } from '@inertiajs/react'; // 1. Pastikan import Link ditambahkan

export default function Dashboard() {
    return (
        <>
            {/* Mengatur judul tab di browser */}
            <Head title="Dashboard Anggota Keuangan" />

            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="p-8 bg-white rounded-xl shadow-md border border-gray-200 text-center">
                    <h1 className="text-2xl font-bold text-gray-800">
                        Ini dashboard anggota keuangan
                    </h1>

                    {/* Saya tambahkan mb-6 (margin-bottom) agar ada jarak dengan tombol */}
                    <p className="text-sm text-gray-500 mt-2 mb-6">
                        Project SIKUDA - KUD Lubuk Karya
                    </p>

                    {/* 2. Tombol Logout Inertia */}
                    <Link
                        href={route('sikuda.logout')}
                        method="post"
                        as="button"
                        className="inline-flex items-center px-4 py-2 bg-red-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-red-500 active:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition ease-in-out duration-150"
                    >
                        Logout
                    </Link>
                </div>
            </div>
        </>
    );
}
