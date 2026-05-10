import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FileText, User, MapPin, AlertCircle, ArrowLeft, Send, CheckCircle, Shield, Clock, Paperclip, X, Calendar, Info 
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { API_BASE_URL } from '../../config';
import styles from '../user/CreateComplaintPage.module.css';

const LaporUmum = () => {
    const navigate = useNavigate();

    const TIME_SLOTS = [
        '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00'
    ];
    
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [reportId, setReportId] = useState('');
    const [trackingCode, setTrackingCode] = useState('');

    const [proposedDate, setProposedDate] = useState('');
    const [proposedTime, setProposedTime] = useState('08:00');

    const [formData, setFormData] = useState({
        guest_name: '',
        guest_email: '',
        guest_phone: '',
        guest_nik: '',
        victim_identity_proof: null,
        victim_type: 'self',
        victim_name: '',
        victim_gender: '',
        victim_relationship: '',
        suspect_name: '',
        suspect_gender: '',
        suspect_status: 'Mahasiswa',
        suspect_affiliation: '',
        suspect_phone: '',
        suspect_whatsapp: '',
        urgency_level: 'medium',
        violence_category_id: '',
        title: '',
        chronology: '',
        location: '',
        incident_date: '',
        attachments: [],
    });

    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/public-categories`, {
                    method: 'GET',
                    headers: { 'Accept': 'application/json' },
                });
                const data = await response.json();
                if (response.ok) {
                    setCategories(data?.data || data);
                }
            } catch (err) {
                console.error('Gagal memuat kategori API', err);
            }
        };
        fetchCategories();
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (name === 'guest_phone' || name === 'suspect_phone' || name === 'suspect_whatsapp') {
            const digits = value.replace(/\D/g, '');
            setFormData(prev => ({ ...prev, [name]: digits }));
            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setFormData(prev => ({
            ...prev,
            attachments: [...prev.attachments, ...files]
        }));
    };

    const removeAttachment = (index) => {
        setFormData(prev => ({
            ...prev,
            attachments: prev.attachments.filter((_, i) => i !== index)
        }));
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.guest_name.trim()) errors.guest_name = 'Nama lengkap wajib diisi';
        if (!formData.guest_email.trim()) errors.guest_email = 'Email wajib diisi';
        if (!formData.guest_phone.trim()) errors.guest_phone = 'Nomor WhatsApp wajib diisi';
        if (!formData.guest_nik.trim()) errors.guest_nik = 'NIK wajib diisi';
        if (!formData.victim_identity_proof) errors.victim_identity_proof = 'Foto KTP wajib diunggah';
        
        if (formData.victim_type === 'other') {
            if (!formData.victim_name.trim()) errors.victim_name = 'Nama korban wajib diisi';
            if (!formData.victim_gender) errors.victim_gender = 'Jenis kelamin korban wajib dipilih';
            if (!formData.victim_relationship.trim()) errors.victim_relationship = 'Hubungan dengan korban wajib diisi';
        } else {
            if (!formData.victim_gender) errors.victim_gender = 'Jenis kelamin Anda wajib dipilih';
        }

        if (!formData.violence_category_id) errors.violence_category_id = 'Kategori wajib dipilih';
        if (!formData.title.trim()) errors.title = 'Judul laporan wajib diisi';
        if (!formData.chronology.trim()) errors.chronology = 'Kronologi kejadian wajib diisi';
        if (formData.chronology.length < 50) errors.chronology = 'Kronologi minimal 50 karakter';
        
        if (!formData.location.trim()) errors.location = 'Lokasi kejadian wajib diisi';
        if (!formData.incident_date) errors.incident_date = 'Tanggal kejadian wajib diisi';
        
        if (!proposedDate) errors.proposed_date = 'Tanggal usulan wajib dipilih';
        if (!proposedTime) errors.proposed_time = 'Jam usulan wajib dipilih';

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            toast.error('Mohon lengkapi seluruh data yang wajib diisi.');
            return;
        }

        setLoading(true);
        setSubmitError('');

        try {
            const payload = new FormData();
            
            // Basic & Victim
            payload.append('guest_name', formData.guest_name);
            payload.append('guest_email', formData.guest_email);
            payload.append('guest_phone', formData.guest_phone);
            payload.append('guest_nik', formData.guest_nik);
            payload.append('victim_identity_proof', formData.victim_identity_proof);
            payload.append('victim_type', formData.victim_type);
            payload.append('victim_name', formData.victim_type === 'self' ? formData.guest_name : formData.victim_name);
            payload.append('victim_gender', formData.victim_gender);
            payload.append('victim_relationship', formData.victim_type === 'self' ? 'Diri Sendiri' : formData.victim_relationship);
            
            // Suspect
            payload.append('suspect_name', formData.suspect_name || 'Tidak Diketahui');
            payload.append('suspect_gender', formData.suspect_gender || '');
            payload.append('suspect_status', formData.suspect_status);
            payload.append('suspect_affiliation', formData.suspect_affiliation || '-');
            payload.append('suspect_phone', formData.suspect_whatsapp || '');
            
            // Incident
            payload.append('title', formData.title);
            payload.append('violence_category_id', formData.violence_category_id);
            payload.append('urgency_level', formData.urgency_level);
            payload.append('description', formData.chronology);
            payload.append('chronology', formData.chronology);
            payload.append('location', formData.location);
            payload.append('incident_date', formData.incident_date);
            
            // Scheduling
            payload.append('proposed_date', proposedDate);
            payload.append('proposed_time', proposedTime);
            
            // Attachments
            if (formData.attachments.length > 0) {
                formData.attachments.forEach(file => payload.append('attachments[]', file));
            }

            const response = await fetch(`${API_BASE_URL}/public-complaints`, {
                method: 'POST',
                headers: { 'Accept': 'application/json' },
                body: payload,
            });

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                if (response.status === 422 && data?.errors) {
                    const errorMessages = Object.values(data.errors).flat().join(', ');
                    throw new Error(errorMessages);
                }
                throw new Error(data?.message || 'Gagal mengirim laporan.');
            }

            setReportId(data?.data?.report_id || 'ID-LAPORAN');
            setTrackingCode(data?.data?.tracking_code || '');
            setSuccess(true);
            toast.success('Laporan berhasil dikirim!', { icon: '🚀' });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            console.error('Submit error:', err);
            setSubmitError(err.message);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col pt-8 font-['Poppins']">
            <Navbar />
            <Toaster position="top-right" reverseOrder={false} />
            
            <div className="w-full flex-grow pt-16">
                <div className={styles.page}>
                    
                    <header className={styles.header}>
                        <button type="button" className={styles.backButton} onClick={() => navigate('/')}>
                            <ArrowLeft size={20} strokeWidth={1.8} /> Kembali ke Beranda
                        </button>
                        <h1 className="text-3xl font-bold text-gray-900 mt-4">Layanan Pengaduan Publik</h1>
                        <div className="flex items-start bg-blue-50 text-blue-800 p-4 rounded-xl border border-blue-100 mt-4">
                            <Shield className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                            <p className="text-sm font-medium">Identitas Anda akan dirahasiakan. Masyarakat umum dapat melaporkan kejadian melalui formulir ini.</p>
                        </div>
                    </header>

                    {submitError && (
                        <div className="bg-red-50 p-4 rounded-2xl flex items-center gap-3 border border-red-100 mb-6 mx-auto max-w-[1400px]">
                            <AlertCircle size={20} className="text-red-500" />
                            <span className="text-red-700 text-sm font-bold">{submitError}</span>
                        </div>
                    )}

                    {success ? (
                        <div className="max-w-2xl mx-auto py-12 px-6 bg-white rounded-[40px] shadow-2xl shadow-emerald-500/10 border border-emerald-50 text-center">
                            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8 text-emerald-500">
                                <CheckCircle size={48} strokeWidth={2.5} />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Laporan Berhasil Terkirim!</h2>
                            <div className="bg-emerald-50 p-6 rounded-3xl mb-8 text-left text-sm font-medium text-emerald-900 border border-emerald-100">
                                <div className="flex items-center gap-3 mb-4 text-emerald-700">
                                    <Info size={20} />
                                    <strong className="text-base">Simpan Informasi Berikut:</strong>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-emerald-100">
                                        <span className="text-gray-500">Nomor Laporan:</span>
                                        <span className="font-bold text-lg text-emerald-600">{reportId}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-emerald-100">
                                        <div className="flex flex-col">
                                            <span className="text-gray-500">Kode Akses (Rahasia):</span>
                                            <span className="text-[10px] text-emerald-500">*Gunakan kode ini untuk melacak status laporan</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono font-bold text-2xl text-emerald-600 tracking-wider bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
                                                {trackingCode}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mb-8 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3 text-left">
                                <AlertCircle size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-amber-800 leading-relaxed">
                                    <strong>Penting:</strong> Jangan berikan Kode Akses kepada siapapun. Tim Satgas PPKPT tidak akan pernah meminta kode akses Anda.
                                </p>
                            </div>
                            <button 
                                onClick={() => navigate('/')}
                                className="w-full py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                            >
                                Kembali ke Beranda
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4 max-w-[1400px] mx-auto">
                            
                            {/* DATA PELAPOR */}
                            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                                    <h2 className="text-lg font-bold text-gray-800 flex items-center">
                                        <User className="w-5 h-5 mr-2 text-[#8b5cf6]" /> Identitas Pelapor (Masyarakat Umum)
                                    </h2>
                                    <p className="text-xs text-gray-400 mt-1">Lengkapi data diri Anda sebagai pelapor pengaduan.</p>
                                </div>
                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className={styles.formGroup}>
                                        <label className="text-xs text-gray-500 font-medium block mb-1">Nama Lengkap *</label>
                                        <input type="text" name="guest_name" required value={formData.guest_name} onChange={handleInputChange} placeholder="Sesuai KTP" className={styles.input} />
                                        {formErrors.guest_name && <span className={styles.errorText}>{formErrors.guest_name}</span>}
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className="text-xs text-gray-500 font-medium block mb-1">NIK (KTP) *</label>
                                        <input type="text" name="guest_nik" required value={formData.guest_nik} onChange={handleInputChange} placeholder="16 digit NIK" className={styles.input} />
                                        {formErrors.guest_nik && <span className={styles.errorText}>{formErrors.guest_nik}</span>}
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className="text-xs text-gray-500 font-medium block mb-1">WA Aktif *</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-gray-400 font-medium text-sm">+62</span>
                                            <input type="text" name="guest_phone" required value={formData.guest_phone} onChange={handleInputChange} style={{ paddingLeft: '44px' }} placeholder="8123xxx" className={styles.input} />
                                        </div>
                                        {formErrors.guest_phone && <span className={styles.errorText}>{formErrors.guest_phone}</span>}
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className="text-xs text-gray-500 font-medium block mb-1">Email Aktif *</label>
                                        <input type="email" name="guest_email" required value={formData.guest_email} onChange={handleInputChange} placeholder="contoh@gmail.com" className={styles.input} />
                                        {formErrors.guest_email && <span className={styles.errorText}>{formErrors.guest_email}</span>}
                                    </div>
                                </div>
                                <div className="px-6 py-4 bg-purple-50/50 border-t border-gray-100">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Upload Foto KTP Pelapor *</label>
                                    <input type="file" accept="image/*" onChange={(e) => setFormData(prev => ({ ...prev, victim_identity_proof: e.target.files[0] }))} className={styles.input} />
                                    {formErrors.victim_identity_proof && <span className={styles.errorText}>{formErrors.victim_identity_proof}</span>}
                                </div>
                            </section>

                            {/* TIPE KEJADIAN */}
                            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                                    <h2 className="text-lg font-bold text-gray-800 flex items-center"><FileText className="w-5 h-5 mr-2 text-[#8b5cf6]" /> Tipe Kejadian</h2>
                                    <p className="text-xs text-gray-400 mt-1">Pilih siapa yang menjadi korban dalam kejadian ini.</p>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <label className={`cursor-pointer rounded-xl border-2 p-5 transition-all ${formData.victim_type === 'self' ? 'border-[#8b5cf6] bg-purple-50' : 'border-gray-200'}`}>
                                            <div className="flex items-center">
                                                <input type="radio" name="victim_type" value="self" checked={formData.victim_type === 'self'} onChange={handleInputChange} className="w-5 h-5 accent-[#8b5cf6]" />
                                                <span className="ml-3 font-bold text-gray-800">Kejadian yang saya alami sendiri</span>
                                            </div>
                                        </label>
                                        <label className={`cursor-pointer rounded-xl border-2 p-5 transition-all ${formData.victim_type === 'other' ? 'border-[#8b5cf6] bg-purple-50' : 'border-gray-200'}`}>
                                            <div className="flex items-center">
                                                <input type="radio" name="victim_type" value="other" checked={formData.victim_type === 'other'} onChange={handleInputChange} className="w-5 h-5 accent-[#8b5cf6]" />
                                                <span className="ml-3 font-bold text-gray-800">Kejadian dialami orang lain</span>
                                            </div>
                                        </label>
                                    </div>
                                    
                                    <div className="mt-6">
                                        <label className="text-sm font-semibold mb-3 block">{formData.victim_type === 'self' ? 'Jenis Kelamin Anda' : 'Jenis Kelamin Korban'} *</label>
                                        <div className="flex gap-4">
                                            <label className={`flex-1 cursor-pointer rounded-xl border-2 p-4 flex items-center gap-3 ${formData.victim_gender === 'Laki-laki' ? 'border-[#8b5cf6] bg-purple-50' : 'border-gray-100'}`}>
                                                <input type="radio" name="victim_gender" value="Laki-laki" checked={formData.victim_gender === 'Laki-laki'} onChange={handleInputChange} className="w-5 h-5 accent-[#8b5cf6]" />
                                                <span className="text-sm font-bold text-gray-700">Laki-laki</span>
                                            </label>
                                            <label className={`flex-1 cursor-pointer rounded-xl border-2 p-4 flex items-center gap-3 ${formData.victim_gender === 'Perempuan' ? 'border-[#8b5cf6] bg-purple-50' : 'border-gray-100'}`}>
                                                <input type="radio" name="victim_gender" value="Perempuan" checked={formData.victim_gender === 'Perempuan'} onChange={handleInputChange} className="w-5 h-5 accent-[#8b5cf6]" />
                                                <span className="text-sm font-bold text-gray-700">Perempuan</span>
                                            </label>
                                        </div>
                                        {formErrors.victim_gender && <span className={styles.errorText}>{formErrors.victim_gender}</span>}
                                    </div>

                                    {formData.victim_type === 'other' && (
                                        <div className="mt-6 p-5 bg-purple-50 rounded-xl border border-purple-100 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                                            <div><label className="text-sm font-semibold mb-1 block">Nama Korban *</label><input type="text" name="victim_name" required value={formData.victim_name} onChange={handleInputChange} className={styles.input} />{formErrors.victim_name && <span className={styles.errorText}>{formErrors.victim_name}</span>}</div>
                                            <div><label className="text-sm font-semibold mb-1 block">Hubungan *</label><input type="text" name="victim_relationship" required value={formData.victim_relationship} onChange={handleInputChange} placeholder="Teman, Saudara, dll" className={styles.input} />{formErrors.victim_relationship && <span className={styles.errorText}>{formErrors.victim_relationship}</span>}</div>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* DATA TERLAPOR */}
                            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                                    <h2 className="text-lg font-bold text-gray-800 flex items-center"><User className="w-5 h-5 mr-2 text-rose-500" /> Data Terlapor (Pelaku)</h2>
                                    <p className="text-xs text-gray-400 mt-1">Data Terlapor adalah orang yang diduga melakukan tindakan kekerasan.</p>
                                </div>
                                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div><label className="text-sm font-semibold mb-1 block">Nama Terlapor *</label><input type="text" name="suspect_name" required value={formData.suspect_name} onChange={handleInputChange} placeholder="Bisa inisial jika tidak tahu" className={styles.input} /></div>
                                    <div>
                                        <label className="text-sm font-semibold mb-1 block">Jenis Kelamin</label>
                                        <div className="flex gap-2">
                                            <label className={`flex-1 cursor-pointer rounded-xl border p-2.5 text-center transition-all ${formData.suspect_gender === 'Laki-laki' ? 'border-[#8b5cf6] bg-purple-50 text-[#8b5cf6]' : 'border-gray-200 text-gray-500'}`}>
                                                <input type="radio" name="suspect_gender" value="Laki-laki" className="hidden" checked={formData.suspect_gender === 'Laki-laki'} onChange={handleInputChange} />
                                                <span className="text-xs font-bold">Laki-laki</span>
                                            </label>
                                            <label className={`flex-1 cursor-pointer rounded-xl border p-2.5 text-center transition-all ${formData.suspect_gender === 'Perempuan' ? 'border-[#8b5cf6] bg-purple-50 text-[#8b5cf6]' : 'border-gray-200 text-gray-500'}`}>
                                                <input type="radio" name="suspect_gender" value="Perempuan" className="hidden" checked={formData.suspect_gender === 'Perempuan'} onChange={handleInputChange} />
                                                <span className="text-xs font-bold">Perempuan</span>
                                            </label>
                                        </div>
                                    </div>
                                    <div><label className="text-sm font-semibold mb-1 block">Status *</label>
                                        <select name="suspect_status" required value={formData.suspect_status} onChange={handleInputChange} className={styles.select}>
                                            <option value="Mahasiswa">Mahasiswa</option><option value="Dosen">Dosen</option><option value="Tenaga Pendidik">Tenaga Pendidik</option><option value="Office Boy (OB)">Office Boy (OB)</option><option value="Satpam">Satpam</option><option value="Pihak Luar">Pihak Luar / Lainnya</option>
                                        </select>
                                    </div>
                                    <div><label className="text-sm font-semibold mb-1 block">Afiliasi/Bagian *</label><input type="text" name="suspect_affiliation" required value={formData.suspect_affiliation} onChange={handleInputChange} placeholder="Jurusan, Prodi, atau Unit" className={styles.input} /></div>
                                    <div><label className="text-sm font-semibold mb-1 block">WhatsApp Terlapor</label><input type="text" name="suspect_whatsapp" value={formData.suspect_whatsapp} onChange={handleInputChange} placeholder="8123xxx (Jika ada)" className={styles.input} /></div>
                                </div>
                            </section>

                            {/* USULAN JADWAL */}
                            <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-white">
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center"><Calendar className="w-6 h-6 mr-3 text-[#8b5cf6]" /> Usulan Jadwal Penanganan</h2>
                                    <p className="text-sm text-gray-500 mt-1">Tim Satgas akan menghubungi Anda sesuai jadwal yang diusulkan.</p>
                                </div>
                                <div className="p-8">
                                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
                                        <Info className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                                        <div className="text-xs text-amber-800 space-y-1">
                                            <p className="font-bold">Ketentuan Jadwal:</p>
                                            <p>• Layanan Konseling: Senin - Kamis (08:00 - 16:00 WIB)</p>
                                            <p>• Hari Jumat - Minggu hanya untuk pengiriman laporan.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-sm font-semibold mb-2 block">Pilih Tanggal *</label>
                                            <input type="date" required min={new Date().toISOString().split('T')[0]} value={proposedDate} onChange={(e) => setProposedDate(e.target.value)} className={styles.input} />
                                            {formErrors.proposed_date && <span className={styles.errorText}>{formErrors.proposed_date}</span>}
                                        </div>
                                        <div className="col-span-full mt-4">
                                            <label className="text-sm font-semibold mb-3 block">Pilih Jam (24 Jam) *</label>
                                            <div className={styles.timeGrid}>
                                                {TIME_SLOTS.map((time) => (
                                                    <button key={time} type="button" onClick={() => setProposedTime(time)} className={`${styles.timeSlot} ${proposedTime === time ? styles.timeSlotActive : ''}`}>
                                                        <Clock size={14} className={proposedTime === time ? 'text-white' : 'text-gray-400'} /> {time}
                                                    </button>
                                                ))}
                                            </div>
                                            {formErrors.proposed_time && <span className={styles.errorText}>{formErrors.proposed_time}</span>}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* INFORMASI TAMBAHAN (Ganti Detail Kejadian) */}
                            <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                                <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2"><FileText size={20} className="text-[#8b5cf6]" /> Informasi Kejadian & Detail</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div><label className="text-sm font-semibold mb-2 block">Tingkat Urgensi *</label><select name="urgency_level" required value={formData.urgency_level} onChange={handleInputChange} className={styles.select}><option value="low">Rendah</option><option value="medium">Sedang</option><option value="high">Tinggi</option></select></div>
                                    <div><label className="text-sm font-semibold mb-2 block">Kategori Kekerasan *</label><select name="violence_category_id" required value={formData.violence_category_id} onChange={handleInputChange} className={styles.select}><option value="">-- Pilih --</option>{categories.map(c => (<option key={c.unique_id || c.id} value={c.unique_id || c.id}>{c.name || c.kategori}</option>))}</select>{formErrors.violence_category_id && <span className={styles.errorText}>{formErrors.violence_category_id}</span>}</div>
                                </div>
                                <div className="mt-6"><label className="text-sm font-semibold mb-2 block">Judul Laporan *</label><input type="text" name="title" required value={formData.title} onChange={handleInputChange} placeholder="Contoh: Pelecehan Verbal di Kelas" className={styles.input} />{formErrors.title && <span className={styles.errorText}>{formErrors.title}</span>}</div>
                                <div className="mt-6">
                                    <label className="text-sm font-semibold mb-1 block">Kronologi Kejadian * (Min 50 Karakter)</label>
                                    <p className="text-[10px] text-gray-400 mb-2 leading-relaxed">Ceritakan secara detail urutan kejadiannya agar mempermudah investigasi Tim Satgas.</p>
                                    <textarea name="chronology" required minLength="50" rows="6" value={formData.chronology} onChange={handleInputChange} placeholder="Ceritakan urutan kejadiannya secara lengkap..." className={styles.textarea} />
                                    {formErrors.chronology && <span className={styles.errorText}>{formErrors.chronology}</span>}
                                </div>
                            </section>

                            {/* LOKASI & WAKTU KEJADIAN */}
                            <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-purple-50 rounded-lg text-[#8b5cf6]"><MapPin size={20} /></div>
                                    <h2 className="text-xl font-bold text-gray-900">Lokasi & Waktu Kejadian</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div><label className="text-sm font-semibold mb-2 block">Lokasi Detail *</label><input type="text" name="location" required value={formData.location} onChange={handleInputChange} placeholder="Gedung, Lantai, atau Ruangan Spesifik" className={styles.input} />{formErrors.location && <span className={styles.errorText}>{formErrors.location}</span>}</div>
                                    <div><label className="text-sm font-semibold mb-2 block">Tanggal Kejadian *</label><input type="date" name="incident_date" required max={new Date().toISOString().split("T")[0]} value={formData.incident_date} onChange={handleInputChange} className={styles.input} />{formErrors.incident_date && <span className={styles.errorText}>{formErrors.incident_date}</span>}</div>
                                </div>
                            </section>

                            {/* LAMPIRAN */}
                            <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                                <label className="text-sm font-semibold mb-4 block flex items-center gap-2"><Paperclip size={18} /> Lampiran Bukti Pendukung (Opsional)</label>
                                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center hover:bg-gray-50 cursor-pointer relative">
                                    <input type="file" multiple accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    <Paperclip className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm font-bold text-gray-500">Klik atau seret file bukti</p>
                                    <p className="text-[10px] text-gray-400 mt-1">Maksimal 10MB (JPG/PNG/PDF)</p>
                                </div>
                                {formData.attachments.length > 0 && (
                                    <div className="mt-4 space-y-2">
                                        {formData.attachments.map((file, i) => (
                                            <div key={i} className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
                                                <span className="text-xs font-bold text-gray-600 truncate flex-1 mr-4">{file.name}</span>
                                                <button type="button" onClick={() => removeAttachment(i)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-all"><X size={16} /></button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>

                            <button type="submit" disabled={loading} className="w-full py-5 bg-[#8b5cf6] text-white font-extrabold rounded-2xl shadow-xl shadow-purple-500/20 hover:bg-[#7c4ee6] disabled:opacity-50 flex items-center justify-center gap-3 transition-all active:scale-[0.99]">
                                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Send size={18} /> Kirim Laporan Pengaduan</>}
                            </button>
                        </form>
                    )}

                </div>
            </div>

            <Footer />
        </div>
    );
};

export default LaporUmum;
