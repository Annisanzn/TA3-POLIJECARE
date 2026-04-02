import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    FiArrowLeft, FiUser, FiMapPin, FiCalendar, FiClock,
    FiAlertCircle, FiFileText, FiLink, FiCheckCircle,
    FiInfo, FiShield, FiMonitor, FiSmartphone
} from 'react-icons/fi';
import { complaintService } from '../../services/complaintService';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';
import axios from '../../api/axios';

// WhatsApp clickable link component
const WaLink = ({ phone, label }) => {
    if (!phone) return <span className="text-gray-400 italic text-sm">-</span>;
    const cleaned = phone.replace(/[^0-9]/g, '');
    const waUrl = `https://wa.me/${cleaned}`;
    return (
        <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-1 px-3 py-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#128C7E] rounded-xl font-semibold text-sm transition-colors"
        >
            {/* WhatsApp SVG icon */}
            <svg viewBox="0 0 32 32" className="w-4 h-4 shrink-0 fill-[#25D366]" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 2C8.268 2 2 8.268 2 16c0 2.52.693 4.881 1.9 6.912L2 30l7.302-1.876A13.934 13.934 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.5a11.43 11.43 0 0 1-5.824-1.594l-.417-.248-4.337 1.114 1.138-4.228-.272-.435A11.453 11.453 0 0 1 4.5 16C4.5 9.649 9.649 4.5 16 4.5S27.5 9.649 27.5 16 22.351 27.5 16 27.5zm6.29-8.474c-.344-.172-2.034-1.003-2.349-1.118-.315-.115-.545-.172-.774.172-.23.344-.888 1.118-1.09 1.347-.2.229-.4.258-.745.086-.344-.172-1.452-.535-2.767-1.707-1.022-.913-1.712-2.04-1.913-2.384-.2-.344-.021-.53.15-.701.155-.154.344-.4.516-.6.172-.2.229-.344.344-.573.115-.23.057-.43-.029-.602-.086-.172-.774-1.866-1.06-2.556-.279-.671-.563-.58-.774-.59l-.66-.012c-.23 0-.602.086-.917.43s-1.204 1.176-1.204 2.87 1.233 3.33 1.405 3.56c.172.23 2.428 3.71 5.882 5.205.823.355 1.465.567 1.966.725.826.263 1.578.226 2.172.137.663-.099 2.034-.831 2.32-1.634.287-.803.287-1.491.2-1.634-.086-.143-.315-.229-.66-.4z"/>
            </svg>
            {label || phone}
        </a>
    );
};

const ComplaintDetail = ({ isCounselor = false }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [complaint, setComplaint] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchComplaint();
    }, [id]);

    const fetchComplaint = async () => {
        try {
            setIsLoading(true);
            // Determine which base API to use, but since Operator & Counselor routes have exactly the same response, 
            // we can use the same utility if backend allows counselor access (which it does via the API change we made).
            // However, we need to respect the prefix: /operator/complaints or /konselor/complaints
            const endpoint = isCounselor
                ? `/konselor/complaints/${id}`
                : `/operator/complaints/${id}`;

            // We will just use Axios directly for the Counselor if not using the operator service
            const response = isCounselor
                ? await axios.get(endpoint)
                : await complaintService.getComplaintById(id);

            if (response.data?.success) {
                setComplaint(response.data.data);
            } else {
                setError('Gagal memuat detail pengaduan.');
            }
        } catch (err) {
            console.error(err);
            setError('Terjadi kesalahan atau pengaduan tidak ditemukan.');
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'approved': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'completed': return 'bg-green-100 text-green-800 border-green-200';
            case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getUrgencyBadge = (urgency) => {
        switch (urgency) {
            case 'Tinggi': return 'bg-red-50 text-red-700 border-red-200';
            case 'Sedang': return 'bg-orange-50 text-orange-700 border-orange-200';
            case 'Rendah': return 'bg-blue-50 text-blue-700 border-blue-200';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex">
                <Sidebar collapsed={sidebarCollapsed} toggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />
                <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
                    <Topbar />
                    <div className="flex-1 p-8 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !complaint) {
        return (
            <div className="min-h-screen bg-gray-50 flex">
                <Sidebar collapsed={sidebarCollapsed} toggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />
                <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
                    <Topbar />
                    <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
                        <FiAlertCircle className="w-16 h-16 text-red-400 mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Pencarian Gagal</h2>
                        <p className="text-gray-600 mb-6">{error || 'Data tidak ditemukan'}</p>
                        <button onClick={() => navigate(-1)} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl shadow-sm hover:bg-indigo-700 transition-colors">
                            Kembali
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <div className="fixed inset-y-0 left-0 z-30" style={{ background: isCounselor ? 'linear-gradient(180deg, #4C1D95 0%, #6D28D9 100%)' : 'inherit' }}>
                <Sidebar collapsed={sidebarCollapsed} toggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />
            </div>

            <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
                <Topbar />

                <main className="p-6 w-full">
                    {/* Header Action */}
                    <div className="mb-6 flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 shadow-sm transition-all"
                        >
                            <FiArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                Detail Laporan
                                <span className={`px-3 py-1 text-sm rounded-full border ${getStatusBadge(complaint.status)}`}>
                                    {complaint.status.toUpperCase()}
                                </span>
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">ID Referensi: #{complaint.report_id}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Left Column - Main Details */}
                        <div className="lg:col-span-2 space-y-6">

                            {complaint.status === 'rejected' && complaint.rejection_reason && (
                                <div className="p-5 bg-rose-50 border border-rose-100 rounded-2xl shadow-sm">
                                    <h3 className="text-sm font-bold text-rose-800 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <FiInfo className="w-4 h-4" /> Alasan Penolakan Laporan
                                    </h3>
                                    <p className="text-sm text-rose-900 leading-relaxed italic">"{complaint.rejection_reason}"</p>
                                </div>
                            )}

                            {/* Incident Details Card */}
                            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                                    <FiInfo className="text-indigo-600" />
                                    <h2 className="font-semibold text-gray-800">Informasi Kejadian</h2>
                                </div>
                                <div className="p-6 space-y-6">
                                    <div>
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Judul Laporan</h3>
                                        <p className="text-lg font-medium text-gray-900">{complaint.title || 'Tidak ada judul'}</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <div>
                                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Kategori Kekerasan</h3>
                                            <div className="flex items-center gap-2 text-gray-900 font-medium">
                                                <FiShield className="text-indigo-500" />
                                                {complaint.violence_category_name || '-'}
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Tingkat Urgensi</h3>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getUrgencyBadge(complaint.urgency_level)}`}>
                                                {complaint.urgency_level || '-'}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Lokasi Kejadian</h3>
                                            <div className="flex items-start gap-2 text-gray-900">
                                                <FiMapPin className="text-red-500 mt-0.5 shrink-0" />
                                                <span className="font-medium">{complaint.location || '-'}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Koordinat GPS</h3>
                                            <p className="text-sm text-gray-700 font-mono bg-white px-2 py-1 rounded border border-gray-200 inline-block">
                                                {complaint.latitude && complaint.longitude ? `${complaint.latitude}, ${complaint.longitude}` : 'Tidak dilampirkan'}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Deskripsi Lengkap</h3>
                                        <div className="bg-white border border-gray-200 rounded-xl p-4 text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                                            {complaint.description || '-'}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Kronologi Singkat</h3>
                                        <div className="bg-white border border-gray-200 rounded-xl p-4 text-gray-700 text-sm leading-relaxed whitespace-pre-wrap border-l-4 border-l-indigo-500">
                                            {complaint.chronology || '-'}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Lampiran Bukti</h3>
                                        {complaint.file_path ? (
                                            <div className="space-y-3">
                                                <p className="text-xs text-gray-500">Dokumen/media bukti dilampirkan oleh pelapor.</p>
                                                <a
                                                    href={`http://127.0.0.1:8000/storage/${complaint.file_path}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-50 text-indigo-700 rounded-xl hover:bg-indigo-100 transition-colors border border-indigo-200 font-medium text-sm shadow-sm"
                                                >
                                                    <FiLink size={16} />
                                                    Lihat Dokumen / Media Lampiran
                                                </a>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-500 text-sm italic">
                                                <FiFileText size={16} className="text-gray-400 shrink-0" />
                                                Tidak ada lampiran bukti dari pelapor
                                            </div>
                                        )}
                                    </div>

                                </div>
                            </div>
                        </div>

                        {/* Right Column - Meta Data */}
                        <div className="space-y-6">

                            {/* Reporter Info */}
                            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                                    <FiUser className="text-indigo-600" />
                                    <h2 className="font-semibold text-gray-800">Data Pelapor & Korban</h2>
                                </div>
                                <div className="p-5 space-y-4">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Nama Pelapor</p>
                                        <p className="font-medium text-gray-900 border-b border-dashed border-gray-200 pb-2">
                                            {complaint.user_name}
                                            {complaint.is_anonymous && <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full inline-block">Mode Anonim</span>}
                                        </p>
                                        {!complaint.is_anonymous && complaint.user_id && complaint.user_phone && (
                                            <div className="mt-2">
                                                <WaLink phone={complaint.user_phone} label={`WA: ${complaint.user_phone}`} />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Status Korban</p>
                                        <p className="font-medium text-gray-900 border-b border-dashed border-gray-200 pb-2">
                                            {complaint.victim_type === 'self' ? 'Diri Sendiri (Pelapor)' : 'Orang Lain'}
                                        </p>
                                    </div>
                                    {complaint.victim_type !== 'self' && (
                                        <>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Nama Korban (Pihak Lain)</p>
                                                <p className="font-medium text-gray-900 border-b border-dashed border-gray-200 pb-2">
                                                    {complaint.victim_name || '-'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Hubungan dengan Korban</p>
                                                <p className="font-medium text-gray-900">
                                                    {complaint.victim_relationship || '-'}
                                                </p>
                                            </div>
                                        </>
                                    )}
                                    {!complaint.user_id && (
                                        <div className="bg-green-50 p-3 rounded-xl border border-green-200 mt-2 space-y-2">
                                            <p className="text-xs font-semibold text-green-800">Kontak Tamu / Eksternal</p>
                                            <WaLink phone={complaint.guest_phone} label={`WA: ${complaint.guest_phone}`} />
                                            {complaint.guest_email && (
                                                <p className="text-sm text-gray-600">Email: <a href={`mailto:${complaint.guest_email}`} className="text-indigo-600 hover:underline">{complaint.guest_email}</a></p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Data Terlapor */}
                            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                                    <FiAlertCircle className="text-rose-600" />
                                    <h2 className="font-semibold text-gray-800">Data Terlapor (Pelaku)</h2>
                                </div>
                                <div className="p-5 space-y-4">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Nama Terlapor</p>
                                        <p className="font-medium text-gray-900 border-b border-dashed border-gray-200 pb-2">
                                            {complaint.suspect_name || '-'}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Status</p>
                                            <p className="font-medium text-gray-900 border-b border-dashed border-gray-200 pb-2">
                                                {complaint.suspect_status || '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Nomor WA/Telepon</p>
                                            <WaLink phone={complaint.suspect_phone} label={complaint.suspect_phone} />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Afiliasi / Unit / Jurusan</p>
                                        <p className="font-medium text-gray-900">
                                            {complaint.suspect_affiliation || '-'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Counseling Info */}
                            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                                    <FiCalendar className="text-indigo-600" />
                                    <h2 className="font-semibold text-gray-800">Jadwal & Penanganan</h2>
                                </div>
                                <div className="p-5 space-y-4">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Konselor Bertugas</p>
                                        <p className="font-medium text-gray-900">
                                            {complaint.counselor_name || 'Belum Ditugaskan'}
                                        </p>
                                    </div>
                                    <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                                        <p className="text-xs text-indigo-600 mb-1 font-medium">Jadwal Konseling</p>
                                        <div className="flex items-center justify-between">
                                            <p className="font-semibold text-indigo-900">
                                                {complaint.counseling_schedule ? new Date(complaint.counseling_schedule).toLocaleDateString('id-ID', {
                                                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                                                }) : 'Belum Dijadwalkan'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Timestamps & Digital Footprint */}
                            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                                    <FiMonitor className="text-indigo-600" />
                                    <h2 className="font-semibold text-gray-800">Log Sistem</h2>
                                </div>
                                <div className="p-5 space-y-4">
                                    <div className="flex justify-between items-center text-sm border-b border-dashed border-gray-200 pb-2">
                                        <span className="text-gray-500">Dibuat Pada</span>
                                        <span className="font-medium text-gray-900">{new Date(complaint.created_at).toLocaleString('id-ID')}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm border-b border-dashed border-gray-200 pb-2">
                                        <span className="text-gray-500">Terakhir Update</span>
                                        <span className="font-medium text-gray-900">{new Date(complaint.updated_at).toLocaleString('id-ID')}</span>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">IP Address Pelapor</p>
                                        <p className="font-mono text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded inline-block">{complaint.ip_address || 'Tidak Terdeteksi'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">User Agent (Perangkat)</p>
                                        <p className="text-xs text-gray-500 leading-tight bg-gray-50 p-2 rounded border border-gray-100 break-words">
                                            {complaint.user_agent || '-'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ComplaintDetail;
