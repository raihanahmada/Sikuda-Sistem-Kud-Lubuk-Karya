import { useForm } from '@inertiajs/react';
import InputField from '@/Components/anggota/InputField';
import ModalShell from './ModalShell';
import { AlertTriangle, UploadCloud, Save, UserPlus } from 'lucide-react';

function InfoItem({ label, value }) {
    return (
        <div>
            <p className="text-sm text-gray-400 mb-1 dark:text-gray-500">{label}</p>
            <p className="text-base font-medium text-gray-800 dark:text-gray-100">{value}</p>
        </div>
    );
}

// mode: 'detail' | 'edit' | 'create'
export default function ModalPendaftaran({ mode, data, onTutup }) {
    const isCreate = mode === 'create';

    const form = useForm(isCreate ? {
        nik: '',
        nama_lengkap: '',
        alamat: '',
        no_telepon: '',
        tanggal_daftar: '',
        file_kk: null,
        file_ktp: null,
        file_surat_pernyataan: null,
    } : {
        nama_lengkap: data?.nama_lengkap || '',
        alamat: data?.alamat || '',
        no_telepon: data?.no_telepon || '',
    });

    const simpan = (e) => {
        e.preventDefault();
        const opsi = { preserveScroll: true, onSuccess: onTutup };
        if (isCreate) {
            form.post(route('admin-anggota.pendaftaran-anggota.store'), opsi);
        } else {
            form.put(route('admin-anggota.pendaftaran-anggota.update', data.id_anggota), opsi);
        }
    };

    const judul = mode === 'detail' ? 'Detail Pendaftaran Anggota' : mode === 'edit' ? 'Edit Data Pendaftaran' : 'Form Pendaftaran Anggota';
    const subjudul = mode === 'detail' && data ? `ID Anggota #${data.id_anggota}` : 'KUD Lubuk Karya';

    return (
        <ModalShell title={judul} subtitle={subjudul} icon={UserPlus} onTutup={onTutup} maxWidth="max-w-2xl">
            {mode === 'detail' ? (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-white border border-emerald-200 shadow-sm rounded-2xl p-5 dark:bg-gray-900 dark:border-emerald-900/30">
                        <InfoItem label="Nomor Induk Kependudukan (NIK)" value={data.nik} />
                        <InfoItem label="Nama Lengkap" value={data.nama_lengkap} />
                        <InfoItem label="Alamat" value={data.alamat} />
                        <InfoItem label="No Telepon" value={data.no_telepon || '-'} />
                        <InfoItem label="Tanggal Daftar" value={data.tanggal_daftar} />
                        <InfoItem label="Nomor Surat Permohonan" value={data.no_surat_permohonan} />
                        <div className="md:col-span-2">
                            <p className="text-sm text-gray-400 mb-1.5 dark:text-gray-500">Status Keanggotaan</p>
                            <span className="inline-block bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-semibold dark:bg-amber-900/15 dark:text-amber-400">
                                {data.status_keanggotaan}
                            </span>
                        </div>
                    </div>
                    <div className="flex justify-end pt-2">
                        <button type="button" onClick={onTutup}
                            className="rounded-xl px-5 py-2.5 text-sm font-semibold text-gray-500 hover:bg-gray-100 transition dark:text-gray-400 dark:hover:bg-gray-800">
                            Tutup
                        </button>
                    </div>
                </div>
            ) : (
                <form onSubmit={simpan} className="space-y-4">
                    {isCreate && (
                        <InputField
                            label="NIK"
                            placeholder="NIK"
                            value={form.data.nik}
                            onChange={e => form.setData('nik', e.target.value)}
                            error={form.errors.nik}
                        />
                    )}

                    <InputField
                        label="Nama Lengkap"
                        placeholder="Nama Lengkap"
                        value={form.data.nama_lengkap}
                        onChange={e => form.setData('nama_lengkap', e.target.value)}
                        error={form.errors.nama_lengkap}
                    />

                    <div>
                        <label className="block text-base font-medium text-gray-600 mb-1.5 dark:text-gray-300">Alamat</label>
                        <textarea
                            placeholder="Alamat"
                            rows="3"
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-[#1B8A3A]/20 focus:border-[#1B8A3A] dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-500"
                            value={form.data.alamat}
                            onChange={e => form.setData('alamat', e.target.value)}
                        />
                        {form.errors.alamat && <div className="text-red-500 text-sm mt-1 dark:text-red-400">{form.errors.alamat}</div>}
                    </div>

                    <InputField
                        label="No Telepon"
                        placeholder="No Telepon"
                        value={form.data.no_telepon}
                        onChange={e => form.setData('no_telepon', e.target.value)}
                        error={form.errors.no_telepon}
                    />

                    {isCreate && (
                        <>
                            <InputField
                                label="Tanggal Daftar"
                                type="date"
                                value={form.data.tanggal_daftar}
                                onChange={e => form.setData('tanggal_daftar', e.target.value)}
                                error={form.errors.tanggal_daftar}
                            />

                            <div className="grid sm:grid-cols-3 gap-4 pt-2">
                                <div>
                                    <label className="block text-base font-medium text-gray-600 mb-1.5 dark:text-gray-300">File Kartu Keluarga (KK)</label>
                                    <label className="flex flex-col items-center justify-center gap-1.5 border border-dashed border-emerald-200 bg-emerald-50/30 rounded-xl px-3 py-4 text-center cursor-pointer hover:bg-emerald-50 hover:border-[#1B8A3A]/40 transition dark:border-emerald-900/30 dark:bg-emerald-900/10 dark:hover:bg-emerald-900/20">
                                        <UploadCloud size={20} className="text-[#1B8A3A]" />
                                        <span className="text-sm text-gray-500 truncate max-w-full dark:text-gray-400">{form.data.file_kk ? form.data.file_kk.name : 'Pilih file'}</span>
                                        <input type="file" accept="image/*,.pdf" className="hidden" onChange={e => form.setData('file_kk', e.target.files[0])} />
                                    </label>
                                    {form.errors.file_kk && <div className="text-red-500 text-sm mt-1 dark:text-red-400">{form.errors.file_kk}</div>}
                                </div>

                                <div>
                                    <label className="block text-base font-medium text-gray-600 mb-1.5 dark:text-gray-300">File KTP</label>
                                    <label className="flex flex-col items-center justify-center gap-1.5 border border-dashed border-emerald-200 bg-emerald-50/30 rounded-xl px-3 py-4 text-center cursor-pointer hover:bg-emerald-50 hover:border-[#1B8A3A]/40 transition dark:border-emerald-900/30 dark:bg-emerald-900/10 dark:hover:bg-emerald-900/20">
                                        <UploadCloud size={20} className="text-[#1B8A3A]" />
                                        <span className="text-sm text-gray-500 truncate max-w-full dark:text-gray-400">{form.data.file_ktp ? form.data.file_ktp.name : 'Pilih file'}</span>
                                        <input type="file" accept="image/*,.pdf" className="hidden" onChange={e => form.setData('file_ktp', e.target.files[0])} />
                                    </label>
                                    {form.errors.file_ktp && <div className="text-red-500 text-sm mt-1 dark:text-red-400">{form.errors.file_ktp}</div>}
                                </div>

                                <div>
                                    <label className="block text-base font-medium text-gray-600 mb-1.5 dark:text-gray-300">File Surat Pernyataan</label>
                                    <label className="flex flex-col items-center justify-center gap-1.5 border border-dashed border-emerald-200 bg-emerald-50/30 rounded-xl px-3 py-4 text-center cursor-pointer hover:bg-emerald-50 hover:border-[#1B8A3A]/40 transition dark:border-emerald-900/30 dark:bg-emerald-900/10 dark:hover:bg-emerald-900/20">
                                        <UploadCloud size={20} className="text-[#1B8A3A]" />
                                        <span className="text-sm text-gray-500 truncate max-w-full dark:text-gray-400">{form.data.file_surat_pernyataan ? form.data.file_surat_pernyataan.name : 'Pilih file'}</span>
                                        <input type="file" accept="image/*,.pdf" className="hidden" onChange={e => form.setData('file_surat_pernyataan', e.target.files[0])} />
                                    </label>
                                    {form.errors.file_surat_pernyataan && <div className="text-red-500 text-sm mt-1 dark:text-red-400">{form.errors.file_surat_pernyataan}</div>}
                                    <p className="text-sm text-gray-400 mt-1 dark:text-gray-500">Format: JPG, PNG, atau PDF. Maks 5MB.</p>
                                </div>
                            </div>

                            {form.data.nik && form.data.nik.length !== 16 ? (
                                <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 text-base rounded-xl dark:bg-amber-900/15 dark:border-amber-900/30 dark:text-amber-400">
                                    <AlertTriangle size={18} className="shrink-0" />
                                    NIK harus terdiri dari 16 digit angka.
                                </div>
                            ) : null}
                        </>
                    )}

                    <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <button type="button" onClick={onTutup}
                            className="rounded-xl px-5 py-2.5 text-sm font-semibold text-gray-500 hover:bg-gray-100 transition dark:text-gray-400 dark:hover:bg-gray-800">
                            Batal
                        </button>
                        <button type="submit" disabled={form.processing}
                            className="inline-flex items-center gap-2 bg-[#1B8A3A] hover:bg-[#157030] text-white px-5 py-2.5 rounded-xl text-base font-semibold transition disabled:opacity-70">
                            <Save size={18} />
                            {form.processing ? 'Menyimpan…' : 'Simpan'}
                        </button>
                    </div>
                </form>
            )}
        </ModalShell>
    );
}
