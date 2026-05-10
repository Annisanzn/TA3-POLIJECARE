import React, { useState } from 'react';
import { 
    Search, FileText, Clock, CheckCircle, AlertCircle, ArrowLeft, Shield, Calendar, MapPin, 
    ChevronRight, Info, Copy, Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { API_BASE_URL } from '../../config';
import styles from '../user/CreateComplaintPage.module.css';

const TrackingLaporan = () => {
    const navigate = useNavigate();
    const [reportId, setReportId] = useState('');
    const [trackingCode, setTrackingCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [complaint, setComplaint] = useState(null);
    const [error, setError] = useState('');

    const handleTrack = async (e) => {
        e.preventDefault();
        if (!reportId || !trackingCode) {
            toast.error('Mohon isi Nomor Laporan dan Kode Akses.');
            return;
        }

        setLoading(true);
        setError('');
        setComplaint(null);

        try {
            const response = await fetch(`${API_BASE_URL}/public/track?report_id=${reportId}&tracking_code=${trackingCode}`, {
                headers: { 'Accept': 'application/json' }
            });
            const data = await response.json();

            if (response.ok) {
                setComplaint(data.data);
                toast.success('Laporan ditemukan!');
            } else {
                setError(data.message || 'Laporan tidak ditemukan.');
                toast.error(data.message || 'Laporan tidak ditemukan.');
            }
        } catch (err) {
            setError('Terjadi kesalahan koneksi. Silakan coba lagi.');
            toast.error('Terjadi kesalahan koneksi.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusInfo = (status) => {
        switch (status) {
            case 'pending':
                return { label: 'Menunggu Review', color: 'text-amber-600', bg: 'bg-amber-100', icon: <Clock size={24} />, step: 1 };
            case 'approved':
                return { label: 'Disetujui / Dalam Proses', color: 'text-blue-600', bg: 'bg-blue-100', icon: <CheckCircle size={24} />, step: 2 };
            case 'completed':
                return { label: 'Selesai', color: 'text-emerald-600', bg: 'bg-emerald-100', icon: <CheckCircle size={24} />, step: 3 };
            case 'rejected':
                return { label: 'Ditolak', color: 'text-rose-600', bg: 'bg-rose-100', icon: <AlertCircle size={24} />, step: 0 };
            default:
                return { label: 'Unknown', color: 'text-gray-600', bg: 'bg-gray-100', icon: <Info size={24} />, step: 0 };
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-['Poppins']">
            <Navbar />
            <Toaster position="top-right" />
            
            <div className="flex-grow pt-24 pb-12 px-4">
                <div className="max-w-4xl mx-auto">
                    
                    <button 
                        onClick={() => navigate('/')}
                        className="flex items-center text-gray-500 hover:text-gray-800 transition-colors mb-6 text-sm font-medium"
                    >
                        <ArrowLeft size={18} className="mr-2" /> Kembali ke Beranda
                    </button>

                    <header className="mb-10 text-center">
                        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Lacak Status Laporan</h1>
                        <p className="text-gray-500 max-w-xl mx-auto leading-relaxed">
                            Pantau perkembangan laporan Anda secara real-time dengan memasukkan identitas laporan yang telah diberikan.
                        </p>
                    </header>

                    {/* Search Form */}
                    <div className="bg-white rounded-[32px] shadow-xl shadow-gray-200/50 p-8 border border-gray-100 mb-8 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full -mr-16 -mt-16 opacity-50 blur-3xl"></div>
                        <form onSubmit={handleTrack} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Nomor Laporan</label>
                                <div className="relative">
                                    <FileText className="absolute left-4 top-3.5 text-gray-400" size={18} />
                                    <input 
                                        type="text" 
                                        placeholder="LPR-XXXXXXXX-XXXX"
                                        value={reportId}
                                        onChange={(e) => setReportId(e.target.value.toUpperCase())}
                                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-transparent focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 rounded-2xl transition-all font-bold text-gray-800"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Kode Akses Rahasia</label>
                                <div className="relative">
                                    <Shield className="absolute left-4 top-3.5 text-gray-400" size={18} />
                                    <input 
                                        type="text" 
                                        maxLength="6"
                                        placeholder="6 Digit Kode"
                                        value={trackingCode}
                                        onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
                                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-transparent focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 rounded-2xl transition-all font-mono font-bold text-gray-800 tracking-widest"
                                    />
                                </div>
                            </div>
                            <div className="flex items-end">
                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="w-full py-3.5 bg-[#8b5cf6] hover:bg-[#7c4ee6] text-white font-bold rounded-2xl shadow-lg shadow-purple-200 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Search size={20} /> Lacak Sekarang</>}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Result */}
                    {complaint && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                            
                            {/* Summary Card */}
                            <div className="bg-white rounded-[32px] shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
                                <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="px-3 py-1 bg-purple-50 text-purple-600 text-[10px] font-bold uppercase tracking-wider rounded-full">Laporan Publik</span>
                                            <span className="text-gray-300">•</span>
                                            <span className="text-gray-500 text-xs font-medium">{new Date(complaint.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-900">{complaint.title}</h2>
                                    </div>
                                    <div className={`px-5 py-2.5 rounded-2xl flex items-center gap-2 font-bold text-sm ${getStatusInfo(complaint.status).bg} ${getStatusInfo(complaint.status).color}`}>
                                        {getStatusInfo(complaint.status).icon}
                                        {getStatusInfo(complaint.status).label}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-50">
                                    <div className="p-6 text-center">
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Kategori</div>
                                        <div className="text-sm font-bold text-gray-700">{complaint.category}</div>
                                    </div>
                                    <div className="p-6 text-center">
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Urgensi</div>
                                        <div className="flex items-center justify-center gap-1.5">
                                            <div className={`w-2 h-2 rounded-full ${complaint.urgency_level === 'high' || complaint.urgency_level === 'critical' ? 'bg-rose-500' : 'bg-amber-500'}`}></div>
                                            <div className="text-sm font-bold text-gray-700 uppercase">{complaint.urgency_level}</div>
                                        </div>
                                    </div>
                                    <div className="p-6 text-center">
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Update Terakhir</div>
                                        <div className="text-sm font-bold text-gray-700">{new Date(complaint.updated_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</div>
                                    </div>
                                </div>
                            </div>

                            {/* Timeline Card */}
                            <div className="bg-white rounded-[32px] shadow-xl shadow-gray-200/50 p-8 border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-8 flex items-center gap-3">
                                    <Clock className="text-purple-500" size={20} /> Riwayat Penanganan
                                </h3>

                                <div className="space-y-12 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                                    
                                    {/* Timeline Items */}
                                    {complaint.history && complaint.history.length > 0 ? (
                                        complaint.history.map((step, idx) => (
                                            <div key={idx} className="relative pl-10">
                                                <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10 ${step.status === 'completed' ? 'bg-emerald-500' : (step.status === 'rejected' ? 'bg-rose-500' : 'bg-blue-500')}`}>
                                                    <Check size={12} className="text-white" />
                                                </div>
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                                                    <h4 className="font-bold text-gray-800 capitalize">{step.status}</h4>
                                                    <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                                                        {new Date(step.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                {step.notes && (
                                                    <div className="bg-gray-50 p-4 rounded-2xl text-sm text-gray-600 border border-gray-100">
                                                        {step.notes}
                                                    </div>
                                                )}
                                                {step.tanggal && (
                                                    <div className="mt-2 flex items-center gap-4 text-xs font-medium text-gray-500">
                                                        <span className="flex items-center gap-1"><Calendar size={14} /> {step.tanggal}</span>
                                                        <span className="flex items-center gap-1"><Clock size={14} /> {step.jam_mulai}</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="relative pl-10">
                                            <div className="absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-white shadow-sm bg-amber-500 flex items-center justify-center z-10">
                                                <Clock size={12} className="text-white" />
                                            </div>
                                            <div className="flex flex-col mb-1">
                                                <h4 className="font-bold text-gray-800">Laporan Diterima</h4>
                                                <span className="text-[10px] font-bold text-gray-400">
                                                    {new Date(complaint.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500">Laporan Anda telah masuk ke sistem dan sedang menunggu antrian review oleh Tim Satgas PPKPT.</p>
                                        </div>
                                    )}

                                </div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="animate-in zoom-in duration-300 bg-rose-50 border border-rose-100 rounded-[32px] p-10 text-center">
                            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-500">
                                <AlertCircle size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Ups! Terjadi Kesalahan</h3>
                            <p className="text-gray-600 mb-8 max-w-sm mx-auto">{error}</p>
                            <button 
                                onClick={() => setError('')}
                                className="px-8 py-3 bg-white border border-gray-200 text-gray-600 font-bold rounded-2xl hover:bg-gray-50 transition-all"
                            >
                                Coba Lagi
                            </button>
                        </div>
                    )}

                    {!complaint && !error && !loading && (
                        <div className="mt-12 bg-blue-50/50 rounded-[32px] p-8 border border-blue-100 flex flex-col md:flex-row items-center gap-6">
                            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                                <Info size={32} />
                            </div>
                            <div>
                                <h4 className="font-bold text-blue-900 mb-1">Tips Pelacakan</h4>
                                <p className="text-sm text-blue-800/70 leading-relaxed">
                                    Gunakan Nomor Laporan dan Kode Akses yang diberikan sesaat setelah Anda mengirim laporan. Jika Anda kehilangan data tersebut, silakan hubungi admin melalui fitur Kontak.
                                </p>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            <Footer />
        </div>
    );
};

export default TrackingLaporan;
