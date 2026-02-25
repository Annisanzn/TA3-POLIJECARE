import React, { useEffect, useState } from 'react';
import {
    FiCalendar, FiClock, FiCheck, FiX,
    FiEdit, FiTrash2, FiPlus, FiFilter, FiSearch,
    FiRefreshCw, FiInfo
} from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import axios from '../../api/axios';
import Sidebar from '../../components/layout/Sidebar';

/* ── Toast ─────────────────────────────────────────────────────────────────── */
const Toast = ({ toast, onClose }) => {
    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(onClose, 3500);
        return () => clearTimeout(t);
    }, [toast]);
    if (!toast) return null;
    return (
        <div className={`fixed top-5 right-5 z-[100] flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
            {toast.msg}
        </div>
    );
};

/* ── Helpers ─────────────────────────────────────────────────────────────────── */
const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

const generateTimeSlots = (schedule) => {
    const slots = [];
    const start = new Date(`1970-01-01T${schedule.jam_mulai}`);
    const end = new Date(`1970-01-01T${schedule.jam_selesai}`);
    const duration = schedule.slot_duration || 60;
    let current = start;
    while (current.getTime() + duration * 60000 <= end.getTime()) {
        const slotEnd = new Date(current.getTime() + duration * 60000);
        slots.push({ start: current.toTimeString().substring(0, 5), end: slotEnd.toTimeString().substring(0, 5) });
        current = slotEnd;
    }
    return slots;
};

/* ── Schedule Form ─────────────────────────────────────────────────────────── */
const ScheduleForm = ({ data, onChange }) => (
    <div className="space-y-5">
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hari</label>
            <select name="hari" value={data.hari} onChange={onChange} required className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow">
                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jam Mulai</label>
                <input type="time" name="jam_mulai" value={data.jam_mulai} onChange={onChange} required className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jam Selesai</label>
                <input type="time" name="jam_selesai" value={data.jam_selesai} onChange={onChange} required className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow" />
            </div>
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Durasi Slot (menit)</label>
            <input type="number" name="slot_duration" value={data.slot_duration} onChange={onChange} min="15" max="120" step="15" required className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow" />
        </div>
        <div className="flex items-center gap-2">
            <input type="checkbox" id="is_active" name="is_active" checked={data.is_active} onChange={onChange} className="h-4 w-4 text-green-600 border-gray-300 rounded" />
            <label htmlFor="is_active" className="text-sm text-gray-700">Aktif</label>
        </div>
    </div>
);

/* ── Main ─────────────────────────────────────────────────────────────────────── */
const KonselorJadwalKonselor = () => {
    const { user } = useAuth();

    const [collapsed, setCollapsed] = useState(false);
    const [schedules, setSchedules] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [search, setSearch] = useState('');
    const [dayFilter, setDayFilter] = useState('all');
    const [statusFilter, setStatus] = useState('all');

    const BLANK = { hari: 'Senin', jam_mulai: '08:00', jam_selesai: '17:00', slot_duration: 60, is_active: true };
    const [addModal, setAddModal] = useState(false);
    const [editModal, setEditModal] = useState({ open: false, schedule: null });
    const [deleteModal, setDelete] = useState({ open: false, schedule: null });
    const [formData, setFormData] = useState(BLANK);
    const [submitting, setSubmitting] = useState(false);

    const showToast = (msg, type = 'success') => setToast({ msg, type });

    const fetchSchedules = async () => {
        setIsLoading(true);
        try {
            // Route ada di konselor group: /api/konselor/counselor-schedules
            const res = await axios.get('/konselor/counselor-schedules');
            if (res.data.success) {
                // Filter hanya jadwal milik konselor yang sedang login
                const mine = (res.data.data || []).filter(s => s.counselor_id === user?.id);
                setSchedules(mine);
            }
        } catch (e) {
            showToast('Gagal memuat jadwal', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchSchedules(); }, [user]);

    useEffect(() => {
        let f = [...schedules];
        if (dayFilter !== 'all') f = f.filter(s => s.hari === dayFilter);
        if (statusFilter !== 'all') f = f.filter(s => s.is_active === (statusFilter === 'active'));
        if (search) {
            const q = search.toLowerCase();
            f = f.filter(s => s.hari.toLowerCase().includes(q) || s.jam_mulai?.includes(q) || s.jam_selesai?.includes(q));
        }
        setFiltered(f);
    }, [schedules, dayFilter, statusFilter, search]);

    const handleInputChange = ({ target }) => {
        const { name, value, type, checked } = target;
        setFormData(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await axios.post('/konselor/counselor-schedules', { ...formData, counselor_id: user?.id });
            if (res.data.success) {
                showToast('Jadwal berhasil ditambahkan!');
                setAddModal(false);
                setFormData(BLANK);
                fetchSchedules();
            } else {
                showToast(res.data.message || 'Gagal menambahkan jadwal', 'error');
            }
        } catch (e) {
            showToast(e.response?.data?.message || 'Gagal menambahkan jadwal', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await axios.put(`/konselor/counselor-schedules/${editModal.schedule.id}`, formData);
            if (res.data.success) {
                showToast('Jadwal berhasil diperbarui!');
                setEditModal({ open: false, schedule: null });
                fetchSchedules();
            } else {
                showToast(res.data.message || 'Gagal memperbarui', 'error');
            }
        } catch (e) {
            showToast(e.response?.data?.message || 'Gagal memperbarui jadwal', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        setSubmitting(true);
        try {
            const res = await axios.delete(`/konselor/counselor-schedules/${deleteModal.schedule.id}`);
            if (res.data.success) {
                showToast('Jadwal berhasil dihapus!');
                setDelete({ open: false, schedule: null });
                fetchSchedules();
            } else {
                showToast(res.data.message || 'Gagal menghapus', 'error');
            }
        } catch (e) {
            showToast(e.response?.data?.message || 'Gagal menghapus jadwal', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const openEdit = (s) => {
        setEditModal({ open: true, schedule: s });
        setFormData({ hari: s.hari, jam_mulai: s.jam_mulai, jam_selesai: s.jam_selesai, slot_duration: s.slot_duration, is_active: s.is_active });
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Toast toast={toast} onClose={() => setToast(null)} />
            <Sidebar collapsed={collapsed} toggleCollapse={() => setCollapsed(v => !v)} />

            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 px-6 py-4">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Jadwal Konselor</h1>
                            <p className="text-gray-600 mt-1">Kelola jadwal ketersediaan Anda untuk sesi konseling</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={fetchSchedules} disabled={isLoading} className="p-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50">
                                <FiRefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                            </button>
                            <button
                                onClick={() => { setAddModal(true); setFormData(BLANK); }}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors"
                            >
                                <FiPlus size={16} /> Tambah Jadwal
                            </button>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-6">
                    {/* Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {[
                            { label: 'Total Jadwal', value: schedules.length, color: 'bg-blue-100', icon: <FiCalendar className="text-blue-600" size={22} /> },
                            { label: 'Aktif', value: schedules.filter(s => s.is_active).length, color: 'bg-green-100', icon: <FiCheck className="text-green-600" size={22} /> },
                            { label: 'Slot Tersedia', value: schedules.reduce((a, s) => a + generateTimeSlots(s).length, 0), color: 'bg-purple-100', icon: <FiClock className="text-purple-600" size={22} /> },
                            { label: 'Hari Aktif', value: new Set(schedules.filter(s => s.is_active).map(s => s.hari)).size, color: 'bg-yellow-100', icon: <FiInfo className="text-yellow-600" size={22} /> },
                        ].map((stat, i) => (
                            <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-sm">{stat.label}</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-1">{isLoading ? '—' : stat.value}</p>
                                </div>
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>{stat.icon}</div>
                            </div>
                        ))}
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="relative">
                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari hari atau jam..." className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500" />
                            </div>
                            <select value={dayFilter} onChange={e => setDayFilter(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500">
                                <option value="all">Semua Hari</option>
                                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                            <select value={statusFilter} onChange={e => setStatus(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500">
                                <option value="all">Semua Status</option>
                                <option value="active">Aktif</option>
                                <option value="inactive">Nonaktif</option>
                            </select>
                        </div>
                    </div>

                    {/* Cards */}
                    {isLoading ? (
                        <div className="flex justify-center py-16">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                            <FiCalendar size={48} className="mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada jadwal</h3>
                            <p className="text-gray-500 mb-6">Tambahkan jadwal ketersediaan Anda</p>
                            <button onClick={() => { setAddModal(true); setFormData(BLANK); }} className="px-6 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 text-sm font-medium">
                                <FiPlus className="inline mr-1" size={16} /> Tambah Jadwal Pertama
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {filtered.map(s => {
                                const slots = generateTimeSlots(s);
                                return (
                                    <div key={s.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all">
                                        <div className="p-5">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900">{s.hari}</h3>
                                                    <p className="text-sm text-gray-500">{s.jam_mulai?.substring(0, 5)} – {s.jam_selesai?.substring(0, 5)}</p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${s.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {s.is_active ? 'Aktif' : 'Nonaktif'}
                                                </span>
                                            </div>
                                            <div className="mb-4">
                                                <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-2">
                                                    <FiClock size={14} /> <span>Durasi: {s.slot_duration} menit</span>
                                                </div>
                                                <p className="text-xs font-medium text-gray-600 mb-2">Slot Tersedia:</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {slots.length > 0 ? slots.map((sl, i) => (
                                                        <span key={i} className="px-2.5 py-1 bg-green-100 text-green-800 text-xs rounded-full">{sl.start}–{sl.end}</span>
                                                    )) : <span className="text-xs text-gray-400">Tidak ada slot</span>}
                                                </div>
                                            </div>
                                            <div className="flex gap-2 pt-3 border-t border-gray-100">
                                                <button onClick={() => openEdit(s)} className="flex-1 py-2 text-sm bg-yellow-50 text-yellow-700 hover:bg-yellow-100 rounded-xl font-medium transition-colors">
                                                    <FiEdit className="inline mr-1" size={14} /> Edit
                                                </button>
                                                <button onClick={() => setDelete({ open: true, schedule: s })} className="flex-1 py-2 text-sm bg-red-50 text-red-700 hover:bg-red-100 rounded-xl font-medium transition-colors">
                                                    <FiTrash2 className="inline mr-1" size={14} /> Hapus
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </main>
            </div>

            {/* Add Modal */}
            {addModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40" onClick={() => !submitting && setAddModal(false)} />
                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Tambah Jadwal</h3>
                        <form onSubmit={handleAdd}>
                            <ScheduleForm data={formData} onChange={handleInputChange} />
                            <div className="flex gap-3 mt-6">
                                <button type="button" onClick={() => setAddModal(false)} disabled={submitting} className="flex-1 py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors">Batal</button>
                                <button type="submit" disabled={submitting} className="flex-1 py-2.5 bg-green-600 text-white border border-transparent rounded-xl text-sm font-medium hover:bg-green-700 shadow-sm disabled:opacity-60 transition-colors">{submitting ? 'Menyimpan...' : 'Simpan'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40" onClick={() => !submitting && setEditModal({ open: false, schedule: null })} />
                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Edit Jadwal</h3>
                        <form onSubmit={handleEdit}>
                            <ScheduleForm data={formData} onChange={handleInputChange} />
                            <div className="flex gap-3 mt-6">
                                <button type="button" onClick={() => setEditModal({ open: false, schedule: null })} disabled={submitting} className="flex-1 py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors">Batal</button>
                                <button type="submit" disabled={submitting} className="flex-1 py-2.5 bg-green-600 text-white border border-transparent rounded-xl text-sm font-medium hover:bg-green-700 shadow-sm disabled:opacity-60 transition-colors">{submitting ? 'Menyimpan...' : 'Simpan Perubahan'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {deleteModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40" onClick={() => !submitting && setDelete({ open: false, schedule: null })} />
                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FiTrash2 className="text-red-600" size={22} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Hapus Jadwal</h3>
                        <p className="text-gray-500 text-sm mb-6">Yakin ingin menghapus jadwal <strong>{deleteModal.schedule?.hari}</strong>? Tindakan ini tidak dapat dibatalkan.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDelete({ open: false, schedule: null })} disabled={submitting} className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm hover:bg-gray-50">Batal</button>
                            <button onClick={handleDelete} disabled={submitting} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 disabled:opacity-60">{submitting ? 'Menghapus...' : 'Hapus'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KonselorJadwalKonselor;
