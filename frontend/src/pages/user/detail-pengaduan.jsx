import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FiArrowLeft, FiClock, FiFileText, FiUser,
    FiAlertCircle, FiLock, FiInfo, FiActivity, FiTag
} from 'react-icons/fi';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';
import userComplaintService from '../../services/userComplaintService';
import dayjs from 'dayjs';
import 'dayjs/locale/id';

dayjs.locale('id');

const DetailPengaduan = () => {
    const { id } = useParams();
    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                setLoading(true);
                const res = await userComplaintService.getDetailPengaduan(id);
                setComplaint(res.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Gagal memuat detail laporan.');
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

    const getStatusInfo = (status) => {
        switch (status) {
            case 'pending':
                return { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', barState: 1 };
            case 'processing':
                return { label: 'Diproses', color: 'bg-blue-100 text-blue-800', barState: 2 };
            case 'resolved':
                return { label: 'Selesai', color: 'bg-green-100 text-green-800', barState: 3 };
            case 'rejected':
                return { label: 'Ditolak', color: 'bg-red-100 text-red-800', barState: 0 };
            default:
                return { label: '-', color: 'bg-gray-100 text-gray-800', barState: 1 };
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
                    <Topbar />
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
                    <Topbar />
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

    const statusInfo = getStatusInfo(complaint.status);

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar collapsed={sidebarCollapsed} toggleCollapse={toggleSidebar} />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Topbar />

                <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 md:p-8">
                    <div className="max-w-5xl mx-auto">
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
                                {complaint.is_anonymous && (
                                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 text-white text-xs font-medium rounded-lg shadow-sm">
                                        <FiLock className="w-3.5 h-3.5" /> Dilaporkan Anonim
                                    </span>
                                )}
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

                                {/* Status Progress Bar */}
                                {statusInfo.barState > 0 && (
                                    <div className="mt-8 pt-6 border-t border-gray-50">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Progress Laporan</p>
                                        </div>
                                        <div className="relative">
                                            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-gray-100">
                                                <div style={{ width: `${(statusInfo.barState / 3) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-[#8B5CF6] transition-all duration-1000"></div>
                                            </div>
                                            <div className="flex justify-between text-xs font-medium text-gray-400 px-1">
                                                <span className={statusInfo.barState >= 1 ? 'text-[#8B5CF6]' : ''}>Pending</span>
                                                <span className={statusInfo.barState >= 2 ? 'text-[#8B5CF6]' : ''}>Diproses</span>
                                                <span className={statusInfo.barState >= 3 ? 'text-[#8B5CF6]' : ''}>Selesai</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100 bg-gray-50/30">
                                {/* Left Column: Detail Utama */}
                                <div className="col-span-2 p-6 md:p-8">
                                    <section className="mb-10 text-gray-800">
                                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                                            <FiFileText className="text-[#8B5CF6]" /> Deskripsi Kejadian
                                        </h3>
                                        <div className="bg-white p-5 rounded-xl border border-gray-100 text-sm leading-relaxed whitespace-pre-wrap shadow-sm text-gray-700">
                                            {complaint.description}
                                        </div>
                                    </section>

                                    <section className="text-gray-800">
                                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                                            <FiActivity className="text-[#8B5CF6]" /> Kronologi Rinci
                                        </h3>
                                        <div className="bg-white p-5 rounded-xl border border-gray-100 text-sm leading-relaxed whitespace-pre-wrap shadow-sm text-gray-700">
                                            {complaint.chronology || <span className="text-gray-400 italic">Tidak ada rincian kronologi yang dilampirkan.</span>}
                                        </div>
                                    </section>
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
                                                    {complaint.is_anonymous ? 'Dilindungi (Anonim)' : (complaint.ip_address || 'Tidak Tersedia')}
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
