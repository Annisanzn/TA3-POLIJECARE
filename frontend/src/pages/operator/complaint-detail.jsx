import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    FiArrowLeft, FiUser, FiMapPin, FiCalendar, FiClock,
    FiAlertCircle, FiFileText, FiLink, FiCheckCircle,
    FiInfo, FiShield, FiMonitor, FiSmartphone,
    FiPlus, FiMessageSquare, FiUploadCloud, FiPaperclip, FiLoader,
    FiX, FiExternalLink
} from 'react-icons/fi';
import { complaintService } from '../../services/complaintService';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { getStorageUrl } from '../../utils/imageUrl';
import axios from '../../api/axios';

// WhatsApp clickable link component
const WaLink = ({ phone, label }) => {
    if (!phone) return <span className="text-gray-400 dark:text-slate-600 italic text-sm">-</span>;
    let cleaned = phone.replace(/[^0-9]/g, '');
    if (cleaned.startsWith('0')) {
        cleaned = '62' + cleaned.substring(1);
    }
    const waUrl = `https://wa.me/${cleaned}`;
    return (
        <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-1 px-3 py-2 bg-[#25D366]/10 dark:bg-[#25D366]/20 border border-[#25D366]/30 dark:border-[#25D366]/40 text-[#128C7E] dark:text-[#25D366] rounded-xl font-bold text-sm transition-all active:scale-95"
        >
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
    const { user } = useAuth();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth < 1024);
    const [complaint, setComplaint] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isSubmittingNote, setIsSubmittingNote] = useState(false);
    const [noteForm, setNoteForm] = useState({
        activeSessionId: null,
        counselee_type: 'pelapor',
        counselee_name: '',
        keterangan_pihak: '',
        saran_konselor: '',
        attachment: null
    });

    const [counselors, setCounselors] = useState([]);
    const [assignModal, setAssignModal] = useState(false);
    const [assignForm, setAssignForm] = useState({
        counselor_id: '',
        tanggal: '',
        jam_mulai: '09:00',
        jam_selesai: '10:00',
        metode: 'offline',
        lokasi: 'Ruang Satgas PPKS'
    });
    const [isAssigning, setIsAssigning] = useState(false);

    useEffect(() => {
        fetchComplaint();
        if (user?.role === 'operator' || user?.role === 'admin') {
            fetchCounselors();
        }
    }, [id, user]);

    const fetchCounselors = async () => {
        try {
            const res = await axios.get('/operator/counseling/counselors');
            // Support both wrapped and unwrapped data structure
            const data = res.data.data || res.data || [];
            setCounselors(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error fetching counselors', err);
        }
    };

    const handleAssignSubmit = async (e) => {
        e.preventDefault();
        setIsAssigning(true);
        try {
            const payload = {
                ...assignForm,
                complaint_id: id,
                counselee_name: complaint.user_name || complaint.guest_name,
                guest_email: complaint.user_email || complaint.guest_email,
                jenis_pengaduan: complaint.violence_category_name,
                status: 'approved'
            };
            
            const res = await axios.post('/operator/counseling/request', payload);
            if (res.data.success) {
                setAssignModal(false);
                fetchComplaint();
                alert('Konselor berhasil ditugaskan dan jadwal dibuat!');
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Gagal menugaskan konselor');
        } finally {
            setIsAssigning(false);
        }
    };

    const handleNoteSubmit = async (e) => {
        e.preventDefault();
        if (!noteForm.keterangan_pihak.trim()) return;
        setIsSubmittingNote(true);

        try {
            const formData = new FormData();
            formData.append('keterangan_pihak', noteForm.keterangan_pihak);
            formData.append('saran_konselor', noteForm.saran_konselor);
            if (noteForm.attachment) {
                formData.append('feedback_attachment', noteForm.attachment);
            }

            let endpoint = '/konselor/jadwal';
            if (noteForm.activeSessionId) {
                endpoint = `/konselor/jadwal/${noteForm.activeSessionId}/feedback`;
            } else {
                formData.append('complaint_id', id);
                formData.append('counselee_type', noteForm.counselee_type);
                formData.append('counselee_name', noteForm.counselee_name);
                formData.append('is_record_only', '1');
                formData.append('status', 'completed');
                formData.append('tanggal', new Date().toISOString().split('T')[0]);
                formData.append('jam_mulai', new Date().toTimeString().slice(0, 5));
                formData.append('jam_selesai', new Date().toTimeString().slice(0, 5));
            }

            const res = await axios.post(endpoint, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success) {
                setNoteForm({ activeSessionId: null, counselee_type: 'pelapor', counselee_name: '', keterangan_pihak: '', saran_konselor: '', attachment: null });
                fetchComplaint();
            }
        } catch (err) {
            console.error(err);
            alert('Gagal menyimpan catatan');
        } finally {
            setIsSubmittingNote(false);
        }
    };

    const fetchComplaint = async () => {
        try {
            setIsLoading(true);
            const endpoint = isCounselor
                ? `/konselor/complaints/${id}`
                : `/operator/complaints/${id}`;

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
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
            case 'approved': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
            case 'completed': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
            case 'rejected': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
            default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
        }
    };

    const getUrgencyBadge = (urgency) => {
        switch (urgency) {
            case 'Tinggi': return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
            case 'Sedang': return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800';
            case 'Rendah': return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
            default: return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700';
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex">
                <Sidebar collapsed={sidebarCollapsed} toggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />
                <div className="flex-1 flex flex-col">
                    <Topbar onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)} title="Memuat Laporan..." />
                    <div className="flex-1 p-8 flex items-center justify-center">
                        <FiLoader className="animate-spin h-12 w-12 text-indigo-600" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !complaint) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex">
                <Sidebar collapsed={sidebarCollapsed} toggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />
                <div className="flex-1 flex flex-col transition-all duration-300">
                    <Topbar onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)} title="Laporan Tidak Ditemukan" />
                    <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
                        <FiAlertCircle className="w-16 h-16 text-red-400 mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Pencarian Gagal</h2>
                        <p className="text-gray-600 dark:text-slate-400 mb-6">{error || 'Data tidak ditemukan'}</p>
                        <button onClick={() => navigate(-1)} className="px-6 py-3 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition-all font-bold text-xs uppercase tracking-widest">
                            Kembali
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex font-['Poppins']">
            <Sidebar collapsed={sidebarCollapsed} toggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />
            
            <div className="flex-1 flex flex-col transition-all duration-300 min-w-0">
                <Topbar onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)} title={`Laporan #${complaint?.report_id}`} />

                <main className="p-4 md:p-8 w-full max-w-7xl mx-auto space-y-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 shadow-sm transition-all active:scale-95"
                            >
                                <FiArrowLeft size={20} />
                            </button>
                             <div>
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                                    Detail Laporan
                                </h1>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest opacity-80">Informasi Lengkap Penanganan Kasus</p>
                            </div>
                        </div>
                         <div className="flex flex-wrap items-center gap-3">
                            <span className={`px-4 py-1.5 text-[10px] font-bold rounded-full border shadow-sm ${getStatusBadge(complaint.status)}`}>
                                {complaint.status}
                            </span>
                            <span className="text-[10px] text-slate-900 dark:text-white font-bold bg-white dark:bg-slate-900 px-4 py-1.5 rounded-full border border-gray-200 dark:border-slate-800 shadow-sm">ID: #{complaint.report_id}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Left Column - Main Details */}
                        <div className="lg:col-span-2 space-y-8">

                            {complaint.status === 'rejected' && complaint.rejection_reason && (
                                 <div className="p-6 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 rounded-[2rem] shadow-sm">
                                    <h3 className="text-xs font-bold text-rose-800 dark:text-rose-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <FiInfo className="w-4 h-4" /> Alasan Penolakan Laporan
                                    </h3>
                                    <p className="text-sm text-rose-900 dark:text-rose-100 leading-relaxed font-medium">"{complaint.rejection_reason}"</p>
                                </div>
                            )}

                            {/* Incident Details Card */}
                             <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-[2.5rem] shadow-sm overflow-hidden">
                                <div className="px-8 py-5 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50 flex items-center gap-3">
                                    <FiInfo className="text-indigo-600 dark:text-indigo-400" />
                                    <h2 className="font-bold text-slate-900 dark:text-white uppercase tracking-tight text-sm">Informasi Kejadian</h2>
                                </div>
                                 <div className="p-8 space-y-8">
                                    <div>
                                        <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Judul Laporan</h3>
                                        <p className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{complaint.title || 'Tidak ada judul'}</p>
                                    </div>

                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-slate-50 dark:bg-slate-950 rounded-[2rem] border border-gray-100 dark:border-slate-800 transition-all">
                                        <div>
                                            <h3 className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Kategori Kekerasan</h3>
                                            <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold text-sm">
                                                <FiShield className="text-indigo-500" />
                                                {complaint.violence_category_name || '-'}
                                            </div>
                                        </div>
                                         <div>
                                            <h3 className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Tingkat Urgensi</h3>
                                            <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-bold border tracking-widest ${getUrgencyBadge(complaint.urgency_level)}`}>
                                                {complaint.urgency_level || '-'}
                                            </span>
                                        </div>
                                         <div>
                                            <h3 className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Lokasi Kejadian</h3>
                                            <div className="flex items-start gap-2 text-slate-900 dark:text-slate-100">
                                                <FiMapPin className="text-rose-500 mt-0.5 shrink-0" />
                                                <span className="font-bold text-sm">{complaint.location || '-'}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Koordinat GPS</h3>
                                            <p className="text-xs text-slate-800 dark:text-slate-300 font-bold bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-slate-800 inline-block tracking-tighter">
                                                {complaint.latitude && complaint.longitude ? `${complaint.latitude}, ${complaint.longitude}` : 'Tidak dilampirkan'}
                                            </p>
                                        </div>
                                    </div>

                                     <div>
                                        <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Deskripsi Lengkap</h3>
                                        <div className="bg-slate-50 dark:bg-slate-950 border border-transparent dark:border-slate-800 rounded-2xl p-6 text-slate-700 dark:text-slate-300 text-sm leading-relaxed font-medium">
                                            {complaint.description || '-'}
                                        </div>
                                    </div>

                                     <div>
                                        <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Kronologi</h3>
                                        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-6 text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap border-l-4 border-l-indigo-600 font-medium">
                                            {complaint.chronology || '-'}
                                        </div>
                                    </div>

                                     <div>
                                        <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Lampiran Bukti</h3>
                                        {(complaint.attachments && complaint.attachments.length > 0) ? (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                                                {complaint.attachments.map((file, idx) => (
                                                    <div key={file.id || idx} className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 hover:shadow-md transition-all group">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                                <FiLink size={20} />
                                                            </div>
                                                             <div className="min-w-0 flex-1">
                                                                <p className="text-xs font-bold text-slate-900 dark:text-white truncate tracking-tight">
                                                                    {file.file_name || `Lampiran ${idx + 1}`}
                                                                </p>
                                                                <p className="text-[9px] text-slate-400 font-bold uppercase">
                                                                    {file.file_size ? (file.file_size / 1024 / 1024).toFixed(2) + ' MB' : 'Lihat File'}
                                                                </p>
                                                            </div>
                                                            <a
                                                                href={file.file_path ? getStorageUrl(file.file_path) : (file.path ? getStorageUrl(file.path) : '#')}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="p-2.5 bg-white dark:bg-slate-900 hover:bg-indigo-600 dark:hover:bg-indigo-600 text-slate-400 hover:text-white rounded-xl transition-all border border-gray-200 dark:border-slate-800"
                                                            >
                                                                <FiExternalLink size={16} />
                                                            </a>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-gray-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest">
                                                <FiFileText size={20} className="opacity-40" />
                                                Tidak ada lampiran bukti
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Counseling Notes Section */}
                            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-[2.5rem] shadow-sm overflow-hidden">
                                 <div className="px-8 py-5 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <FiMessageSquare className="text-indigo-600 dark:text-indigo-400" />
                                        <h2 className="font-bold text-slate-900 dark:text-white uppercase tracking-tight text-sm">Catatan Perkembangan</h2>
                                    </div>
                                    <span className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded-full tracking-widest">
                                        {complaint.counseling_notes?.length || 0} TOTAL
                                    </span>
                                </div>
                                <div className="p-8">
                                    {(isCounselor || user?.role === 'operator') && (
                                         <form onSubmit={handleNoteSubmit} className="mb-12 bg-slate-50 dark:bg-slate-950 border border-indigo-100 dark:border-indigo-900/30 rounded-[2rem] p-8 shadow-inner transition-all">
                                            <h3 className="text-[10px] font-bold text-indigo-900 dark:text-indigo-400 uppercase tracking-widest mb-6 flex items-center justify-between gap-2">
                                                <span className="flex items-center gap-3">
                                                    {noteForm.activeSessionId ? <FiCheckCircle size={18} className="text-emerald-500" /> : <FiPlus size={18} />}
                                                    {noteForm.activeSessionId ? 'Selesaikan Sesi Terjadwal' : 'Tambah Catatan Baru'}
                                                </span>
                                                {noteForm.activeSessionId && (
                                                    <button 
                                                        type="button"
                                                        onClick={() => setNoteForm({ ...noteForm, activeSessionId: null, counselee_type: 'pelapor', counselee_name: '' })}
                                                        className="px-3 py-1 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 transition-colors"
                                                    >
                                                        Batal
                                                    </button>
                                                )}
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                                 <div>
                                                    <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-1">Pihak Tertuju</label>
                                                    <input
                                                        disabled={!!noteForm.activeSessionId}
                                                        list="counselee-types-detail"
                                                        value={noteForm.counselee_type}
                                                        onChange={(e) => setNoteForm({ ...noteForm, counselee_type: e.target.value })}
                                                        placeholder="Cari atau ketik..."
                                                        className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl px-5 py-3 text-sm font-bold text-slate-900 dark:text-white focus:border-indigo-500 outline-none transition-all disabled:opacity-50"
                                                    />
                                                    <datalist id="counselee-types-detail">
                                                        <option value="pelapor">Pelapor</option>
                                                        <option value="terlapor">Terlapor</option>
                                                        <option value="saksi">Saksi</option>
                                                    </datalist>
                                                </div>
                                                <div>
                                                    <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-1">Nama Pihak</label>
                                                    <input
                                                        type="text"
                                                        disabled={!!noteForm.activeSessionId}
                                                        placeholder="Contoh: Nama Terlapor atau Saksi"
                                                        value={noteForm.counselee_name}
                                                        onChange={(e) => setNoteForm({ ...noteForm, counselee_name: e.target.value })}
                                                        className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl px-5 py-3 text-sm font-bold text-slate-900 dark:text-white focus:border-indigo-500 outline-none transition-all disabled:opacity-50"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                                 <div>
                                                    <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-1">Keterangan / Pengakuan</label>
                                                    <textarea
                                                        required
                                                        rows={4}
                                                        placeholder="Tuliskan hasil pengakuan atau temuan..."
                                                        value={noteForm.keterangan_pihak}
                                                        onChange={(e) => setNoteForm({ ...noteForm, keterangan_pihak: e.target.value })}
                                                        className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm font-medium text-slate-800 dark:text-slate-200 focus:border-indigo-500 outline-none transition-all"
                                                    />
                                                </div>
                                                 <div>
                                                    <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-1">Saran / Tindak Lanjut</label>
                                                    <textarea
                                                        rows={4}
                                                        placeholder="Rencana aksi selanjutnya..."
                                                        value={noteForm.saran_konselor}
                                                        onChange={(e) => setNoteForm({ ...noteForm, saran_konselor: e.target.value })}
                                                        className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm font-medium text-slate-800 dark:text-slate-200 focus:border-indigo-500 outline-none transition-all"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                                 <div className="flex-1">
                                                    <label className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl cursor-pointer hover:bg-indigo-50 dark:hover:bg-slate-800 transition-all shadow-sm">
                                                        <FiPaperclip className="text-slate-400 dark:text-slate-500 shrink-0" />
                                                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest truncate">{noteForm.attachment?.name || 'Lampirkan Bukti'}</span>
                                                        <input type="file" className="hidden" onChange={(e) => setNoteForm({ ...noteForm, attachment: e.target.files[0] })} />
                                                    </label>
                                                </div>
                                                 <button
                                                    type="submit"
                                                    disabled={isSubmittingNote || !noteForm.keterangan_pihak.trim()}
                                                    className={`w-full sm:w-auto px-8 py-4 ${noteForm.activeSessionId ? 'bg-emerald-600' : 'bg-indigo-600'} text-white rounded-[1.25rem] font-bold text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3`}
                                                >
                                                    {isSubmittingNote ? <FiLoader className="animate-spin" /> : (noteForm.activeSessionId ? <FiCheckCircle /> : <FiPlus />)}
                                                    {noteForm.activeSessionId ? 'Selesaikan Sesi' : 'Simpan Catatan'}
                                                </button>
                                            </div>
                                        </form>
                                    )}

                                    {/* Timeline of Notes */}
                                    <div className="space-y-8 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-1 before:bg-slate-100 dark:before:bg-slate-800">
                                        {!complaint.counseling_notes || complaint.counseling_notes.length === 0 ? (
                                            <div className="pl-12 py-8 italic text-slate-400 dark:text-slate-600 text-sm font-medium">
                                                Belum ada catatan perkembangan.
                                            </div>
                                        ) : (
                                            complaint.counseling_notes.map((note) => (
                                                <div key={note.id} className="relative pl-12 group">
                                                    <div className="absolute left-0 top-1 w-10 h-10 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 flex items-center justify-center -translate-x-1/2 shadow-sm transition-all group-hover:border-indigo-600 dark:group-hover:border-indigo-500 group-hover:scale-110">
                                                        <FiMessageSquare size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-indigo-600" />
                                                    </div>

                                                    <div className="bg-slate-50 dark:bg-slate-950 group-hover:bg-white dark:group-hover:bg-slate-900 group-hover:shadow-2xl group-hover:shadow-indigo-500/5 group-hover:border-indigo-100 dark:group-hover:border-indigo-900/50 rounded-[2rem] p-8 border border-gray-100 dark:border-slate-800 transition-all duration-500">
                                                         <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                                                            <div className="flex items-center gap-3">
                                                                <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-[9px] font-bold rounded-lg uppercase tracking-widest">
                                                                    {note.counselee_type}
                                                                </span>
                                                                <h4 className="font-bold text-slate-900 dark:text-white text-base tracking-tight uppercase">
                                                                    {note.counselee_name || (note.counselee_type === 'pelapor' ? 'Pelapor' : 'Pihak Terkait')}
                                                                </h4>
                                                                {note.status === 'approved' && (
                                                                    <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[9px] font-bold rounded-lg uppercase tracking-widest flex items-center gap-2">
                                                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-sm"></div>
                                                                        Sesi Aktif
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-6">
                                                                {isCounselor && note.status === 'approved' && (
                                                                    <button 
                                                                        onClick={() => {
                                                                            setNoteForm({ ...noteForm, activeSessionId: note.id, counselee_type: note.counselee_type, counselee_name: note.counselee_name || 'Pelapor' });
                                                                            window.scrollTo({ top: 300, behavior: 'smooth' });
                                                                        }}
                                                                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-[10px] font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 dark:shadow-none uppercase tracking-widest"
                                                                    >
                                                                        <FiCheckCircle size={14} /> Selesaikan
                                                                    </button>
                                                                )}
                                                                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                                                    <FiCalendar size={14} /> {new Date(note.tanggal || note.created_at).toLocaleDateString('id-ID')}
                                                                    <FiClock size={14} className="ml-2" /> {note.jam_mulai?.slice(0, 5)}
                                                                </div>
                                                            </div>
                                                        </div>

                                                         {(note.keterangan_pihak || note.feedback_notes) && (
                                                            <div className="mb-6">
                                                                <p className="text-[9px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-2 px-1">Keterangan / Hasil</p>
                                                                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                                                                    {note.keterangan_pihak || note.feedback_notes}
                                                                </p>
                                                            </div>
                                                        )}

                                                         {note.saran_konselor && (
                                                            <div className="p-6 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 transition-all">
                                                                <p className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2"><FiCheckCircle size={12} /> Saran & Tindak Lanjut</p>
                                                                <p className="text-sm text-indigo-900 dark:text-indigo-100 leading-relaxed font-bold">
                                                                    {note.saran_konselor}
                                                                </p>
                                                            </div>
                                                        )}

                                                         {note.feedback_attachment && (
                                                            <a
                                                                href={`https://api.polijecare.my.id/api/files/view?path=${encodeURIComponent(note.feedback_attachment)}`}
                                                                target="_blank" rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-3 mt-6 px-5 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl text-[10px] font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 transition-all shadow-sm"
                                                            >
                                                                <FiLink size={14} /> Lihat Lampiran Bukti
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Meta Data */}
                        <div className="space-y-8">

                            {/* Reporter Info */}
                             <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-[2.5rem] shadow-sm overflow-hidden">
                                <div className="px-8 py-5 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50 flex items-center gap-3">
                                    <FiUser className="text-indigo-600 dark:text-indigo-400" />
                                    <h2 className="font-bold text-slate-900 dark:text-white uppercase tracking-tight text-sm">Data Pelapor</h2>
                                </div>
                                 <div className="p-8 space-y-6">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Nama Lengkap</p>
                                        <p className="font-bold text-slate-900 dark:text-white text-base tracking-tight uppercase border-b border-dashed border-gray-200 dark:border-slate-800 pb-3">
                                            {complaint.user_name}
                                        </p>
                                        {(complaint.user_phone || complaint.user_email) && (
                                            <div className="mt-6 space-y-4">
                                                {complaint.user_phone && (
                                                    <WaLink phone={complaint.user_phone} label={`WhatsApp: ${complaint.user_phone}`} />
                                                )}
                                                {complaint.user_email && (
                                                    <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-gray-100 dark:border-slate-800">
                                                        <FiFileText size={18} className="text-indigo-400" />
                                                        <a href={`mailto:${complaint.user_email}`} className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors truncate">
                                                            {complaint.user_email}
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                     <div className="pt-4">
                                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Status Pelapor</p>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                                            {complaint.victim_type === 'self' ? 'Diri Sendiri (Korban)' : 'Pelapor (Pihak Lain)'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Data Terlapor */}
                             <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-[2.5rem] shadow-sm overflow-hidden">
                                <div className="px-8 py-5 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50 flex items-center gap-3">
                                    <FiAlertCircle className="text-rose-600" />
                                    <h2 className="font-bold text-slate-900 dark:text-white uppercase tracking-tight text-sm">Data Terlapor</h2>
                                </div>
                                 <div className="p-8 space-y-6">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Nama Terlapor</p>
                                        <p className="font-bold text-slate-900 dark:text-white text-base tracking-tight uppercase border-b border-dashed border-gray-200 dark:border-slate-800 pb-3">
                                            {complaint.suspect_name || '-'}
                                        </p>
                                    </div>
                                     <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Status / Peran</p>
                                            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-widest bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-slate-800 inline-block">
                                                {complaint.suspect_status || '-'}
                                            </p>
                                        </div>
                                         <div>
                                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Kontak Terlapor</p>
                                            <WaLink phone={complaint.suspect_phone} label={complaint.suspect_phone || 'Tidak Tercatat'} />
                                        </div>
                                    </div>
                                     <div>
                                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Unit / Jurusan / Afiliasi</p>
                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-tight">
                                            {complaint.suspect_affiliation || '-'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Counseling Info */}
                             <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-[2.5rem] shadow-sm overflow-hidden border-l-4 border-l-indigo-600">
                                <div className="px-8 py-5 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50 flex items-center gap-3">
                                    <FiCalendar className="text-indigo-600" />
                                    <h2 className="font-bold text-slate-900 dark:text-white uppercase tracking-tight text-sm">Penanganan</h2>
                                </div>
                                 <div className="p-8 space-y-6">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Konselor</p>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase">
                                                {complaint.counselor_name?.substring(0, 2).toUpperCase() || '??'}
                                            </div>
                                            <p className="font-bold text-slate-900 dark:text-white text-sm tracking-tight uppercase">
                                                {complaint.counselor_name || 'Belum Diplot'}
                                            </p>
                                        </div>
                                    </div>
                                     <div className="bg-indigo-600 dark:bg-indigo-500 p-5 rounded-[1.5rem] shadow-xl shadow-indigo-200 dark:shadow-none">
                                        <p className="text-[9px] text-white/70 mb-2 font-bold uppercase tracking-widest">Jadwal Sesi</p>
                                        <div className="flex items-center justify-between">
                                            <p className="font-bold text-white text-sm uppercase tracking-tight">
                                                {complaint.counseling_schedule ? new Date(complaint.counseling_schedule).toLocaleDateString('id-ID', {
                                                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                                                }) : 'Belum Dijadwalkan'}
                                            </p>
                                        </div>
                                    </div>
                                     {user?.role === 'operator' && !complaint.counselor_id && (
                                        <button
                                            onClick={() => setAssignModal(true)}
                                            className="w-full mt-4 py-4 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-600 dark:hover:bg-indigo-500 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3"
                                        >
                                            <FiPlus size={18} /> Plot & Jadwal
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Log Sistem */}
                             <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-[2.5rem] shadow-sm overflow-hidden">
                                <div className="px-8 py-5 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50 flex items-center gap-3">
                                    <FiMonitor className="text-indigo-600 dark:text-indigo-400" />
                                    <h2 className="font-bold text-slate-900 dark:text-white uppercase tracking-tight text-sm">Digital Footprint</h2>
                                </div>
                                <div className="p-8 space-y-5">
                                    <div className="flex justify-between items-center text-[10px] font-bold border-b border-dashed border-gray-100 dark:border-slate-800 pb-3">
                                        <span className="text-slate-400 uppercase tracking-widest">Dibuat</span>
                                        <span className="text-slate-900 dark:text-white uppercase">{new Date(complaint.created_at).toLocaleString('id-ID')}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] font-bold border-b border-dashed border-gray-100 dark:border-slate-800 pb-3">
                                        <span className="text-slate-400 uppercase tracking-widest">Update</span>
                                        <span className="text-slate-900 dark:text-white uppercase">{new Date(complaint.updated_at).toLocaleString('id-ID')}</span>
                                    </div>
                                     <div>
                                        <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">IP Address</p>
                                        <p className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-lg border border-indigo-100 dark:border-indigo-800 inline-block font-bold">{complaint.ip_address || '127.0.0.1'}</p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </main>
            </div>

            {/* Assign Counselor Modal */}
            <AnimatePresence>
                {assignModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/60 dark:bg-slate-950/80 transition-all">
                        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="relative bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 dark:border-slate-800" onClick={e => e.stopPropagation()}>
                             <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 shadow-sm z-10 rounded-t-[2.5rem]" />
                            <div className="px-10 py-8 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/50 dark:bg-slate-800/50">
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight uppercase">Plotting Konselor</h3>
                                <button onClick={() => !isAssigning && setAssignModal(false)} className="text-slate-400 hover:text-rose-500 transition-colors p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm"><FiX size={20} /></button>
                            </div>
                            <form onSubmit={handleAssignSubmit} className="p-10 space-y-6">
                                 <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Pilih Konselor Bertugas <span className="text-rose-500">*</span></label>
                                    <select required value={assignForm.counselor_id} onChange={e => setAssignForm({...assignForm, counselor_id: e.target.value})}
                                        className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border border-transparent dark:border-slate-800 rounded-2xl text-xs font-bold uppercase tracking-widest dark:text-white outline-none focus:border-indigo-500 transition-all shadow-inner appearance-none cursor-pointer">
                                        <option value="">-- Cari Konselor --</option>
                                        {counselors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>

                                 <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Tanggal Sesi <span className="text-rose-500">*</span></label>
                                    <input type="date" required value={assignForm.tanggal} onChange={e => setAssignForm({...assignForm, tanggal: e.target.value})}
                                        className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border border-transparent dark:border-slate-800 rounded-2xl text-xs font-bold uppercase tracking-widest dark:text-white outline-none focus:border-indigo-500 shadow-inner" />
                                </div>

                                 <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Jam Mulai</label>
                                        <input type="time" required value={assignForm.jam_mulai} onChange={e => setAssignForm({...assignForm, jam_mulai: e.target.value})}
                                            className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border border-transparent dark:border-slate-800 rounded-2xl text-xs font-bold dark:text-white outline-none focus:border-indigo-500 shadow-inner" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Jam Selesai</label>
                                        <input type="time" required value={assignForm.jam_selesai} onChange={e => setAssignForm({...assignForm, jam_selesai: e.target.value})}
                                            className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border border-transparent dark:border-slate-800 rounded-2xl text-xs font-bold dark:text-white outline-none focus:border-indigo-500 shadow-inner" />
                                    </div>
                                </div>

                                 <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Metode Konseling</label>
                                    <div className="flex gap-3 p-1.5 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-gray-100 dark:border-slate-800">
                                        <button type="button" onClick={() => setAssignForm({...assignForm, metode: 'offline', lokasi: 'Ruang Satgas PPKS'})}
                                            className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${assignForm.metode === 'offline' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Offline</button>
                                        <button type="button" onClick={() => setAssignForm({...assignForm, metode: 'online', lokasi: 'Google Meet'})}
                                            className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${assignForm.metode === 'online' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Online</button>
                                    </div>
                                </div>

                                 <button type="submit" disabled={isAssigning}
                                    className="w-full py-5 bg-indigo-600 text-white rounded-full font-bold text-xs uppercase tracking-widest shadow-xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 mt-4">
                                    {isAssigning ? <FiLoader className="animate-spin mx-auto" size={20} /> : 'Setujui & Plot Jadwal'}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ComplaintDetail;
