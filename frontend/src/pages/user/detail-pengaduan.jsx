import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FiArrowLeft, FiClock, FiFileText, FiUser,
    FiAlertCircle, FiLock, FiInfo, FiActivity, FiTag,
    FiCheckCircle, FiRefreshCw, FiCalendar, FiMapPin, FiWifi,
    FiShield, FiLink
} from 'react-icons/fi';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';
import userComplaintService from '../../services/userComplaintService';
import api from '../../api/axios';
import { getStorageUrl } from '../../utils/imageUrl';
import dayjs from 'dayjs';
import 'dayjs/locale/id';

dayjs.locale('id');

const DetailPengaduan = () => {
    const { id } = useParams();
    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth < 1024);
    const [counselingSchedule, setCounselingSchedule] = useState(null);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                setLoading(true);
                const res = await userComplaintService.getDetailPengaduan(id);
                setComplaint(res.data);
                // Fetch counseling schedule for this complaint
                try {
                    const schedRes = await api.get(`/user/counseling-schedule?complaint_id=${id}`);
                    const schedData = schedRes.data?.data || schedRes.data;
                    const items = Array.isArray(schedData?.data) ? schedData.data
                        : Array.isArray(schedData) ? schedData : [];
                    // Get the latest schedule
                    setCounselingSchedule(items.length > 0 ? items[items.length - 1] : null);
                } catch {
                    // No schedule yet — that's OK
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Gagal memuat detail laporan.');
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

    // 4-Step counseling schedule status tracker
    const COUNSELING_STEPS = [
        { key: 'pending', label: 'Peninjauan\nLaporan', color: 'bg-amber-500', ring: 'ring-amber-300', text: 'text-amber-600' },
        { key: 'approved', label: 'Sedang\nDitangani', color: 'bg-blue-500', ring: 'ring-blue-300', text: 'text-blue-600' },
        { key: 'reschedule', label: 'Jadwalkan\nUlang', color: 'bg-rose-400', ring: 'ring-rose-300', text: 'text-rose-600' },
        { key: 'completed', label: 'Laporan\nSelesai', color: 'bg-emerald-500', ring: 'ring-emerald-300', text: 'text-emerald-600' },
    ];

    const getCounselingStepIndex = (status) => {
        switch (status) {
            case 'pending': return 0;
            case 'approved': return 1;
            case 'rejected': return 2; // maps to "Jadwalkan Ulang"
            case 'cancelled': return 2;
            case 'completed': return 3;
            default: return -1;
        }
    };

    const getComplaintStatusInfo = (status) => {
        switch (status) {
            case 'pending': return { label: 'Sedang Ditinjau', color: 'bg-amber-100 text-amber-800' };
            case 'approved': return { label: 'Sedang Ditangani', color: 'bg-blue-100 text-blue-800' };
            case 'completed': return { label: 'Selesai', color: 'bg-emerald-100 text-emerald-800' };
            case 'rejected': return { label: 'Jadwalkan Ulang', color: 'bg-rose-100 text-rose-800' };
            default: return { label: '-', color: 'bg-gray-100 text-gray-800' };
        }
    };

    const getUrgencyBadge = (urgency) => {
        switch (urgency) {
            case 'low': return <span className="px-3 py-1 bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg">Rendah</span>;
            case 'medium': return <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-lg">Sedang</span>;
            case 'high': return <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-lg">Tinggi</span>;
            default: return null;
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar collapsed={sidebarCollapsed} toggleCollapse={toggleSidebar} />
                <div className="flex-1 flex flex-col min-w-0">
                    <Topbar onMenuClick={toggleSidebar} title="Memuat Detail..." />
                    <div className="flex-1 flex justify-center items-center">
                        <FiActivity className="animate-spin w-8 h-8 text-[#8B5CF6]" />
                        <span className="ml-3 text-gray-600 font-medium">Memuat data laporan...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !complaint) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar collapsed={sidebarCollapsed} toggleCollapse={toggleSidebar} />
                <div className="flex-1 flex flex-col min-w-0">
                    <Topbar onMenuClick={toggleSidebar} title="Laporan Tidak Ditemukan" />
                    <div className="flex-1 p-6 flex flex-col items-center justify-center">
                        <FiAlertCircle className="w-16 h-16 text-red-400 mb-4" />
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Akses Ditolak / Tidak Ditemukan</h2>
                        <p className="text-gray-500 mb-6">{error}</p>
                        <Link to="/user/histori-pengaduan" className="px-6 py-2 bg-[#8B5CF6] text-white rounded-xl shadow-sm hover:bg-[#7e4ce6] transition-colors">
                            Kembali ke Histori
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const statusInfo = getComplaintStatusInfo(complaint.status);
    const counselingStepIdx = counselingSchedule ? getCounselingStepIndex(counselingSchedule.status) : -1;

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar collapsed={sidebarCollapsed} toggleCollapse={toggleSidebar} />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Topbar onMenuClick={toggleSidebar} title={`Laporan #${complaint?.report_reference || id}`} />

                <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 md:p-8">
                    <div className="w-full">
                        {/* Header / Back Navigation */}
                        <div className="mb-6 flex items-center justify-between">
                            <Link
                                to="/user/histori-pengaduan"
                                className="flex items-center text-gray-500 flex-shrink-0 hover:text-[#8B5CF6] transition-colors group"
                            >
                                <div className="w-8 h-8 rounded-full bg-white border border-gray-200 group-hover:border-[#8B5CF6] flex items-center justify-center mr-3 transition-colors">
                                    <FiArrowLeft className="w-4 h-4" />
                                </div>
                                <span className="font-medium">Kembali ke Daftar</span>
                            </Link>

                            <div className="flex items-center gap-3">
                                {getUrgencyBadge(complaint.urgency_level)}
                            </div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                        >
                            {/* Title Section */}
                            <div className="p-6 md:p-8 border-b border-gray-100">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
                                    <div>
                                        <span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-600 font-mono text-sm rounded mb-3">
                                            REF: {complaint.report_reference}
                                        </span>
                                        <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-2">
                                            {complaint.title}
                                        </h1>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span className="flex items-center gap-1.5">
                                                <FiClock className="w-4 h-4" />
                                                {dayjs(complaint.created_at).format('DD MMMM YYYY, HH:mm')}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <FiTag className="w-4 h-4" />
                                                {complaint.violenceCategory?.name || 'Umum'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex-shrink-0">
                                        <div className={`px-4 py-2.5 rounded-xl font-bold text-sm tracking-wide shadow-sm flex items-center gap-2 ${statusInfo.color}`}>
                                            <div className="w-2 h-2 rounded-full bg-current animate-pulse bg-opacity-70"></div>
                                            {statusInfo.label.toUpperCase()}
                                        </div>
                                    </div>
                                </div>

                                {complaint.status === 'rejected' && complaint.rejection_reason && (
                                    <div className="mx-6 md:mx-8 mb-6 p-5 bg-rose-50 border border-rose-100 rounded-2xl">
                                        <h3 className="text-sm font-bold text-rose-800 uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <FiAlertCircle className="w-4 h-4" /> Alasan Penolakan / Jadwalkan Ulang
                                        </h3>
                                        <p className="text-sm text-rose-900 leading-relaxed italic">"{complaint.rejection_reason}"</p>
                                    </div>
                                )}

                                {/* 4-Step Counseling Status Tracker */}
                                {counselingSchedule ? (
                                    <div className="mt-6 pt-6 border-t border-gray-100">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-5">Status Jadwal Konseling</p>
                                        <div className="relative">
                                            {/* Connector line */}
                                            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 z-0" style={{ left: '12.5%', right: '12.5%' }} />
                                            <div className="flex justify-between relative z-10">
                                                {COUNSELING_STEPS.map((step, idx) => {
                                                    const isCurrent = idx === counselingStepIdx;
                                                    const isDone = idx < counselingStepIdx;
                                                    const isActive = isCurrent || isDone;
                                                    return (
                                                        <div key={step.key} className="flex flex-col items-center w-1/4">
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold transition-all
                                                                ${isActive ? step.color + ' ring-4 ' + step.ring : 'bg-gray-200 text-gray-400'}
                                                                ${isCurrent ? 'scale-110 shadow-lg' : ''}`}>
                                                                {isDone ? <FiCheckCircle size={16} /> : idx + 1}
                                                            </div>
                                                            <p className={`text-center text-[10px] mt-2 font-semibold leading-tight whitespace-pre-line
                                                                ${isCurrent ? step.text : isDone ? 'text-gray-500' : 'text-gray-300'}`}>
                                                                {step.label}
                                                            </p>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        {/* Schedule details */}
                                        <div className="mt-5 p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2 text-sm">
                                            <div className="flex items-center gap-2 text-gray-700">
                                                <FiCalendar size={14} className="text-indigo-500" />
                                                <span className="font-medium">Tanggal:</span>
                                                <span>{counselingSchedule.tanggal ? dayjs(counselingSchedule.tanggal).format('DD MMMM YYYY') : '-'}</span>
                                                <span className="text-gray-400">·</span>
                                                <FiClock size={14} className="text-indigo-500" />
                                                <span>{counselingSchedule.jam_mulai?.substring(0, 5)} – {counselingSchedule.jam_selesai?.substring(0, 5)} WIB</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-700">
                                                {counselingSchedule.metode === 'online'
                                                    ? <FiWifi size={14} className="text-blue-500" />
                                                    : <FiMapPin size={14} className="text-green-500" />}
                                                <span className="font-medium capitalize">{counselingSchedule.metode}:</span>
                                                <span className="text-gray-600">{counselingSchedule.metode === 'online' ? (counselingSchedule.meeting_link || 'Link akan dikirimkan') : (counselingSchedule.lokasi || '-')}</span>
                                            </div>
                                            {counselingSchedule.status === 'rejected' && counselingSchedule.rejection_reason && (
                                                <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                    <p className="text-xs font-bold text-yellow-700 mb-1">Alasan Penjadwalan Ulang:</p>
                                                    <p className="text-xs text-yellow-600">{counselingSchedule.rejection_reason}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mt-6 pt-6 border-t border-gray-100">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Status Jadwal Konseling</p>
                                        <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center">
                                            <FiCalendar size={20} className="mx-auto mb-2 text-gray-300" />
                                            <p className="text-xs text-gray-400">Belum ada jadwal konseling yang terhubung ke laporan ini</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100 bg-gray-50/30">
                                {/* Left Column: Detail Utama */}
                                <div className="col-span-2 p-6 md:p-8">

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-white rounded-xl border border-gray-100 shadow-sm mb-8">
                                        <div>
                                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Kategori Kekerasan</h3>
                                            <div className="flex items-center gap-2 text-gray-900 font-medium">
                                                <FiShield className="text-[#8B5CF6]" />
                                                {complaint.violenceCategory?.name || complaint.violence_category_name || '-'}
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Tingkat Urgensi</h3>
                                            {getUrgencyBadge(complaint.urgency_level)}
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Lokasi Kejadian</h3>
                                            <div className="flex items-start gap-2 text-gray-900">
                                                <FiMapPin className="text-red-500 mt-0.5 shrink-0" />
                                                <span className="font-medium">{complaint.location || '-'}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Koordinat GPS</h3>
                                            <p className="text-sm text-gray-700 font-mono bg-gray-50 px-3 py-1.5 rounded border border-gray-200 inline-block">
                                                {complaint.latitude && complaint.longitude ? `${complaint.latitude}, ${complaint.longitude}` : 'Tidak dilampirkan'}
                                            </p>
                                        </div>
                                    </div>

                                    <section className="mb-10 text-gray-800">
                                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                                            <FiFileText className="text-[#8B5CF6]" /> Deskripsi Kejadian
                                        </h3>
                                        <div className="bg-white p-5 rounded-xl border border-gray-100 text-sm leading-relaxed whitespace-pre-wrap shadow-sm text-gray-700">
                                            {complaint.description}
                                        </div>
                                    </section>

                                    <section className="text-gray-800 mb-10">
                                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                                            <FiActivity className="text-[#8B5CF6]" /> Kronologi Rinci
                                        </h3>
                                        <div className="bg-white p-5 rounded-xl border border-gray-100 text-sm leading-relaxed whitespace-pre-wrap shadow-sm text-gray-700">
                                            {complaint.chronology || <span className="text-gray-400 italic">Tidak ada rincian kronologi yang dilampirkan.</span>}
                                        </div>
                                    </section>

                                    {(complaint.attachments && complaint.attachments.length > 0) ? (
                                        <section className="text-gray-800">
                                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                                                <FiLink className="text-[#8B5CF6]" /> Lampiran Bukti ({complaint.attachments.length})
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {complaint.attachments.map((file, idx) => (
                                                    <div key={file.id || idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                                                <FiLink size={20} />
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <p className="text-xs font-bold text-gray-900 truncate" title={file.file_name || 'Lampiran Bukti'}>
                                                                    {file.file_name || `Lampiran ${idx + 1}`}
                                                                </p>
                                                                <p className="text-[10px] text-gray-500 uppercase tracking-tighter mt-0.5">
                                                                    {file.file_type?.split('/')[1] || 'FILE'} • {file.file_size ? (file.file_size / 1024 / 1024).toFixed(2) + ' MB' : 'Lihat Detail'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <a
                                                            href={file.file_path ? getStorageUrl(file.file_path) : (file.path ? getStorageUrl(file.path) : '#')}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="mt-3 w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-indigo-50 hover:text-indigo-700 transition-colors border border-gray-100 font-bold text-[10px] uppercase tracking-wider"
                                                        >
                                                            BUKA DOKUMEN
                                                        </a>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    ) : (complaint.file_path && (
                                        <section className="text-gray-800">
                                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                                                <FiLink className="text-[#8B5CF6]" /> Lampiran Bukti
                                            </h3>
                                            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                                                <a
                                                    href={getStorageUrl(complaint.file_path)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors border border-indigo-100 font-medium text-sm"
                                                >
                                                    <FiLink size={16} />
                                                    Lihat Dokumen / Media Lampiran
                                                </a>
                                            </div>
                                        </section>
                                    ))}
                                </div>

                                {/* Right Column: Metadata Korban & Teknis */}
                                <div className="col-span-1 p-6 md:p-8 bg-gray-50/80">
                                    <section className="mb-8">
                                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <FiUser className="text-[#8B5CF6]" /> Informasi Korban
                                        </h3>
                                        <ul className="space-y-4 text-sm">
                                            <li className="flex flex-col bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                                                <span className="text-gray-500 text-xs mb-1">Status Laporan (Tipe Korban)</span>
                                                <span className="font-semibold text-gray-900 capitalize">
                                                    {complaint.victim_type === 'self' ? 'Korban Melaporkan Diri Sendiri' : 'Dilaporkan Oleh Orang Lain (Saksi)'}
                                                </span>
                                            </li>
                                            {complaint.victim_type === 'other' && (
                                                <li className="flex flex-col bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                                                    <span className="text-gray-500 text-xs mb-1">Nama Korban</span>
                                                    <span className="font-medium text-gray-900">
                                                        {complaint.victim_name || 'Tidak Disebutkan'}
                                                    </span>
                                                </li>
                                            )}
                                            {complaint.victim_type === 'other' && (
                                                <li className="flex flex-col bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                                                    <span className="text-gray-500 text-xs mb-1">Hubungan Pelapor & Korban</span>
                                                    <span className="font-medium text-gray-900">
                                                        {complaint.victim_relationship || '-'}
                                                    </span>
                                                </li>
                                            )}
                                        </ul>
                                    </section>

                                    <section>
                                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <FiInfo className="text-[#8B5CF6]" /> Metadata Teknis
                                        </h3>
                                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3 text-xs text-gray-600">
                                            <div>
                                                <span className="block text-gray-400 mb-0.5">Penanganan Konselor</span>
                                                <span className="font-medium text-gray-800">
                                                    {complaint.counselor ? complaint.counselor.name : 'Dalam antrean plotting'}
                                                </span>
                                            </div>
                                            <div className="pt-2 border-t border-gray-50">
                                                <span className="block text-gray-400 mb-0.5">IP Address Perekam</span>
                                                <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-gray-500">
                                                    {complaint.ip_address || 'Tidak Tersedia'}
                                                </span>
                                            </div>
                                        </div>
                                    </section>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DetailPengaduan;
