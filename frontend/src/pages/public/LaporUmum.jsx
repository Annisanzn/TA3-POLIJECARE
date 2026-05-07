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
    
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [reportId, setReportId] = useState('');

    const [proposedDate, setProposedDate] = useState('');
    const [proposedTime, setProposedTime] = useState('08:00');
    const [scheduleWarning, setScheduleWarning] = useState('');

    // Validasi Hari Operasional (Senin - Kamis)
    useEffect(() => {
        if (!proposedDate) {
            setScheduleWarning('');
            return;
        }
        const date = new Date(proposedDate + 'T00:00:00');
        const day = date.getDay(); // 0: Minggu, 1: Senin, ..., 4: Kamis, 5: Jumat
        if (day === 0 || day >= 5) {
            setScheduleWarning('⚠️ Penanganan (Konseling) hanya tersedia pada hari Senin sampai Kamis. Silakan pilih hari lain.');
        } else {
            setScheduleWarning('');
        }
    }, [proposedDate]);

    const [formData, setFormData] = useState({
        guest_name: '',
        guest_email: '',
        guest_phone: '',
        guest_nim: '',
        guest_prodi: '',
        guest_unit: '',
        title: '',
        violence_category_id: '',
        urgency_level: 'medium',
        victim_type: 'self',
        victim_name: '',
        victim_gender: '',
        victim_relationship: '',
        suspect_name: '',
        suspect_gender: '',
        suspect_status: '',
        suspect_affiliation: '',
        suspect_phone: '',
        description: '',
        chronology: '',
        location: '',
        latitude: '',
        longitude: '',
        incident_date: '',
        attachments: [],
        victim_identity_proof: null
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
        
        if (name === 'guest_phone' || name === 'suspect_phone') {
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
        
        if (!formData.title.trim()) errors.title = 'Judul laporan wajib diisi';
        if (!formData.violence_category_id) errors.violence_category_id = 'Kategori wajib dipilih';
        
        if (formData.victim_type === 'other') {
            if (!formData.victim_name.trim()) errors.victim_name = 'Nama korban wajib diisi';
            if (!formData.victim_gender) errors.victim_gender = 'Jenis kelamin korban wajib dipilih';
            if (!formData.victim_relationship.trim()) errors.victim_relationship = 'Hubungan dengan korban wajib diisi';
        } else {
            if (!formData.victim_gender) errors.victim_gender = 'Jenis kelamin Anda wajib dipilih';
        }

        if (!formData.description.trim()) errors.description = 'Deskripsi singkat wajib diisi';
        if (!formData.chronology.trim()) errors.chronology = 'Kronologi kejadian wajib diisi';
        if (!formData.location.trim()) errors.location = 'Lokasi kejadian wajib diisi';
        
        if (!proposedDate) errors.proposed_date = 'Tanggal usulan wajib dipilih';
        if (!proposedTime) errors.proposed_time = 'Jam usulan wajib dipilih';

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setLoading(true);
        setSubmitError('');

        try {
            const payload = new FormData();
            
            // Guest Fields
            payload.append('guest_name', formData.guest_name);
            payload.append('guest_email', formData.guest_email);
            payload.append('guest_phone', formData.guest_phone);
            
            // Basic Fields
            payload.append('title', formData.title);
            payload.append('violence_category_id', formData.violence_category_id);
            payload.append('urgency_level', formData.urgency_level);
            
            // Guest Identity
            payload.append('guest_name', formData.guest_name);
            payload.append('guest_email', formData.guest_email);
            payload.append('guest_phone', formData.guest_phone);
            payload.append('guest_nim', formData.guest_nim);
            payload.append('guest_prodi', formData.guest_prodi);
            payload.append('guest_unit', formData.guest_unit);
            
            // Victim Fields
            payload.append('victim_type', formData.victim_type);
            payload.append('victim_name', formData.victim_type === 'self' ? formData.guest_name : formData.victim_name);
            payload.append('victim_gender', formData.victim_gender);
            payload.append('victim_relationship', formData.victim_type === 'self' ? 'Diri Sendiri' : formData.victim_relationship);
            
            // Suspect Fields
            payload.append('suspect_name', formData.suspect_name || 'Tidak Diketahui');
            payload.append('suspect_gender', formData.suspect_gender || '');
            payload.append('suspect_status', formData.suspect_status || 'Lainnya');
            payload.append('suspect_affiliation', formData.suspect_affiliation || '-');
            payload.append('suspect_phone', formData.suspect_phone || '');
            
            // Incident Detail Fields
            payload.append('description', formData.description);
            payload.append('chronology', formData.chronology);
            payload.append('location', formData.location);
            if (formData.incident_date) payload.append('incident_date', formData.incident_date);
            if (formData.latitude !== '' && formData.latitude !== null) payload.append('latitude', formData.latitude);
            if (formData.longitude !== '' && formData.longitude !== null) payload.append('longitude', formData.longitude);
            
            // Scheduling
            payload.append('proposed_date', proposedDate);
            payload.append('proposed_time', proposedTime);
            
            // Attachments
            if (formData.attachments.length > 0) {
                formData.attachments.forEach(file => payload.append('attachments[]', file));
            }
            if (formData.victim_identity_proof) {
                payload.append('victim_identity_proof', formData.victim_identity_proof);
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
            setSuccess(true);
            toast.success('Laporan berhasil dikirim!', {
                duration: 5000,
                icon: '🚀',
                style: {
                    borderRadius: '16px',
                    background: '#334155',
                    color: '#fff',
                    fontWeight: 'bold',
                },
            });
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
                            <ArrowLeft size={20} strokeWidth={1.8} />
                            Kembali ke Beranda
                        </button>
                        <div>
                            <h1 className={styles.title}>📢 Layanan Pengaduan Publik</h1>
                            <p className="opacity-90 mt-2 mb-4 text-gray-500">Masyarakat umum dapat melaporkan tindak kekerasan/perundungan di lingkungan Polije melalui formulir ini.</p>
                        </div>
                    </header>

                    <div className={styles.tipsContainer}>
                        <div className={`${styles.tipCard} ${styles.blue}`}>
                            <h4 className={`${styles.tipTitle} ${styles.blue}`}><Shield size={14} /> Keamanan Data</h4>
                            <p className={`${styles.tipDesc} ${styles.blue}`}>Identitas Anda dijamin aman dan rahasia oleh Tim Satgas PPKPT.</p>
                        </div>
                        <div className={`${styles.tipCard} ${styles.rose}`}>
                            <h4 className={`${styles.tipTitle} ${styles.rose}`}><FileText size={14} /> Bukti Kejadian</h4>
                            <p className={`${styles.tipDesc} ${styles.rose}`}>Lampirkan bukti foto/dokumen untuk mempermudah investigasi.</p>
                        </div>
                        <div className={`${styles.tipCard} ${styles.amber}`}>
                            <h4 className={`${styles.tipTitle} ${styles.amber}`}><Clock size={14} /> Respon Cepat</h4>
                            <p className={`${styles.tipDesc} ${styles.amber}`}>Laporan Anda akan ditinjau dalam waktu maksimal 3x24 jam.</p>
                        </div>
                    </div>

                    {submitError && (
                        <div className={styles.errorCard}>
                            <div className="bg-red-50 p-4 rounded-2xl flex items-center gap-3 border border-red-100 mb-6">
                                <AlertCircle size={20} className="text-red-500" />
                                <span className="text-red-700 text-sm">{submitError}</span>
                            </div>
                        </div>
                    )}

                    {success ? (
                        <div className="max-w-2xl mx-auto py-12 px-6 bg-white rounded-[40px] shadow-2xl shadow-emerald-500/10 border border-emerald-50 text-center animate-in fade-in zoom-in duration-500">
                            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8 text-emerald-500 animate-bounce">
                                <CheckCircle size={48} strokeWidth={2.5} />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Laporan Berhasil Terkirim!</h2>
                            <div className="bg-emerald-50 p-6 rounded-3xl mb-8 text-left">
                                <p className="text-emerald-900 text-sm font-medium leading-relaxed">
                                    <strong>Pesan Penting:</strong><br/>
                                    Laporan Anda telah masuk ke sistem Satgas PPKPT dengan nomor registrasi <strong>{reportId}</strong>. Harap simpan nomor ini atau hubungi Admin via WhatsApp untuk pemantauan lebih lanjut.
                                </p>
                            </div>
                            <p className="text-gray-500 text-sm mb-8">
                                Nomor Registrasi: <span className="font-bold text-emerald-600">{reportId}</span><br/>
                                Tim Satgas akan segera meninjau laporan Anda.
                            </p>
                            <div className="flex flex-col gap-4">
                                <button 
                                    onClick={() => {
                                        const category = categories.find(c => (c.unique_id || c.id) === formData.violence_category_id);
                                        const categoryName = category ? (category.name || category.kategori) : 'Pengaduan Umum';
                                        
                                        const waText = window.encodeURIComponent(
`🌟 *LAPORAN BARU - POLIJE CARE* 🌟

Halo Tim Satgas PPKPT,
Saya telah membuat laporan pengaduan melalui portal publik.

*DETAIL LAPORAN:*
━━━━━━━━━━━━━━━━━━━━
🆔 *ID Laporan:* ${reportId}
📂 *Kategori:* ${categoryName}
📝 *Judul:* ${formData.title}
⏰ *Usulan Jadwal:* ${proposedDate} (${proposedTime} WIB)
━━━━━━━━━━━━━━━━━━━━

Mohon untuk segera ditindaklanjuti. Terima kasih.`
                                        );
                                        window.open(`https://wa.me/628123456789?text=${waText}`);
                                    }}
                                    className="w-full py-5 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-2xl font-bold hover:shadow-2xl hover:shadow-emerald-500/30 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                                >
                                    <Send size={18} /> Hubungi Satgas via WhatsApp
                                </button>
                                <button 
                                    onClick={() => navigate('/')}
                                    className="w-full py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                                >
                                    Kembali ke Beranda
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className={styles.content}>
                            
                            {/* SECTION 1: DATA PELAPOR (PUBLIC ONLY) */}
                            <section className={styles.section}>
                                <h2 className={styles.sectionTitle}>
                                    <User size={20} strokeWidth={1.8} />
                                    Identitas Pelapor (Masyarakat Umum)
                                </h2>
                                <p className={styles.sectionDesc}>Mohon isi data diri Anda dengan benar agar Tim Satgas dapat menghubungi Anda.</p>
                                
                                <div className={styles.formGrid}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Nama Lengkap <span className={styles.required}>*</span></label>
                                        <input
                                            type="text" name="guest_name" required
                                            className={styles.input}
                                            placeholder="Nama sesuai KTP"
                                            value={formData.guest_name} onChange={handleInputChange}
                                        />
                                        {formErrors.guest_name && <span className={styles.errorText}>{formErrors.guest_name}</span>}
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Email Aktif <span className={styles.required}>*</span></label>
                                        <input
                                            type="email" name="guest_email" required
                                            className={styles.input}
                                            placeholder="contoh@gmail.com"
                                            value={formData.guest_email} onChange={handleInputChange}
                                        />
                                        {formErrors.guest_email && <span className={styles.errorText}>{formErrors.guest_email}</span>}
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Nomor WhatsApp <span className={styles.required}>*</span></label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-3 text-gray-400 font-medium">+62</span>
                                            <input
                                                type="text" name="guest_phone" required
                                                className={styles.input} style={{ paddingLeft: '48px' }}
                                                placeholder="8123xxx"
                                                value={formData.guest_phone} onChange={handleInputChange}
                                            />
                                        </div>
                                        {formErrors.guest_phone && <span className={styles.errorText}>{formErrors.guest_phone}</span>}
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>NIM / NIK <span className="text-gray-400 text-[10px] font-normal ml-1">(Opsional)</span></label>
                                        <input
                                            type="text" name="guest_nim"
                                            className={styles.input}
                                            placeholder="Nomor Induk Mahasiswa / KTP"
                                            value={formData.guest_nim} onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Program Studi <span className="text-gray-400 text-[10px] font-normal ml-1">(Opsional)</span></label>
                                        <input
                                            type="text" name="guest_prodi"
                                            className={styles.input}
                                            placeholder="Contoh: Teknologi Rekayasa Perangkat Lunak"
                                            value={formData.guest_prodi} onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Jurusan / Unit <span className="text-gray-400 text-[10px] font-normal ml-1">(Opsional)</span></label>
                                        <input
                                            type="text" name="guest_unit"
                                            className={styles.input}
                                            placeholder="Contoh: Teknologi Informasi"
                                            value={formData.guest_unit} onChange={handleInputChange}
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* SECTION 2: INFORMASI LAPORAN */}
                            <section className={styles.section}>
                                <h2 className={styles.sectionTitle}>
                                    <FileText size={20} strokeWidth={1.8} />
                                    Informasi Laporan
                                </h2>
                                <p className={styles.sectionDesc}>Berikan judul yang jelas dan pilih kategori kekerasan yang sesuai.</p>

                                <div className={styles.formGrid}>
                                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                        <label className={styles.label}>Judul Laporan <span className={styles.required}>*</span></label>
                                        <input
                                            type="text" name="title" required
                                            className={styles.input}
                                            placeholder="Contoh: Pelecehan Verbal di Lingkungan Kampus"
                                            value={formData.title} onChange={handleInputChange}
                                        />
                                        {formErrors.title && <span className={styles.errorText}>{formErrors.title}</span>}
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Kategori Kekerasan <span className={styles.required}>*</span></label>
                                        <select
                                            name="violence_category_id" required
                                            className={styles.select}
                                            value={formData.violence_category_id} onChange={handleInputChange}
                                        >
                                            <option value="">-- Pilih Kategori --</option>
                                            {categories.map((cat, idx) => (
                                                <option key={cat.unique_id || cat.id || idx} value={cat.unique_id || cat.id}>
                                                    {cat.name || cat.kategori}
                                                </option>
                                            ))}
                                        </select>
                                        {formErrors.violence_category_id && <span className={styles.errorText}>{formErrors.violence_category_id}</span>}
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Tingkat Urgensi <span className={styles.required}>*</span></label>
                                        <select
                                            name="urgency_level" required
                                            className={styles.select}
                                            value={formData.urgency_level} onChange={handleInputChange}
                                        >
                                            <option value="low">🟢 Rendah (Tidak mendesak)</option>
                                            <option value="medium">🟡 Sedang (Perlu penanganan)</option>
                                            <option value="high">🔴 Tinggi (Mendesak/Darurat)</option>
                                        </select>
                                    </div>
                                </div>
                            </section>

                            {/* SECTION 3: INFORMASI KORBAN */}
                            <section className={styles.section}>
                                <h2 className={styles.sectionTitle}>
                                    <User size={20} strokeWidth={1.8} />
                                    Informasi Korban
                                </h2>
                                <p className={styles.sectionDesc}>Siapa yang mengalami kejadian ini?</p>

                                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                    <div className={styles.radioGroup}>
                                        <label className={`${styles.radioLabel} ${formData.victim_type === 'self' ? styles.radioLabelActive : ''}`}>
                                            <input
                                                type="radio" name="victim_type" value="self"
                                                className={styles.radioInput}
                                                checked={formData.victim_type === 'self'} onChange={handleInputChange}
                                            />
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-800 text-sm">Saya Sendiri</span>
                                                <span className="text-[11px] text-gray-500">Saya sebagai korban langsung</span>
                                            </div>
                                        </label>
                                        <label className={`${styles.radioLabel} ${formData.victim_type === 'other' ? styles.radioLabelActive : ''}`}>
                                            <input
                                                type="radio" name="victim_type" value="other"
                                                className={styles.radioInput}
                                                checked={formData.victim_type === 'other'} onChange={handleInputChange}
                                            />
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-800 text-sm">Orang Lain</span>
                                                <span className="text-[11px] text-gray-500">Melaporkan orang lain</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <div className={styles.formGrid}>
                                    {formData.victim_type === 'other' && (
                                        <>
                                            <div className={styles.formGroup}>
                                                <label className={styles.label}>Nama Korban <span className={styles.required}>*</span></label>
                                                <input
                                                    type="text" name="victim_name" required
                                                    className={styles.input}
                                                    placeholder="Nama lengkap korban"
                                                    value={formData.victim_name} onChange={handleInputChange}
                                                />
                                                {formErrors.victim_name && <span className={styles.errorText}>{formErrors.victim_name}</span>}
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label className={styles.label}>Hubungan dengan Korban <span className={styles.required}>*</span></label>
                                                <input
                                                    type="text" name="victim_relationship" required
                                                    className={styles.input}
                                                    placeholder="Teman, Keluarga, dll"
                                                    value={formData.victim_relationship} onChange={handleInputChange}
                                                />
                                                {formErrors.victim_relationship && <span className={styles.errorText}>{formErrors.victim_relationship}</span>}
                                            </div>
                                        </>
                                    )}

                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>
                                            {formData.victim_type === 'self' ? 'Jenis Kelamin Anda' : 'Jenis Kelamin Korban'} 
                                            <span className={styles.required}>*</span>
                                        </label>
                                        <div className={styles.radioGroup}>
                                            <label className={`${styles.radioLabel} ${formData.victim_gender === 'Laki-laki' ? styles.radioLabelActive : ''}`}>
                                                <input type="radio" name="victim_gender" value="Laki-laki" checked={formData.victim_gender === 'Laki-laki'} onChange={handleInputChange} className={styles.radioInput} />
                                                <span className="text-sm font-medium text-gray-700">Laki-laki</span>
                                            </label>
                                            <label className={`${styles.radioLabel} ${formData.victim_gender === 'Perempuan' ? styles.radioLabelActive : ''}`}>
                                                <input type="radio" name="victim_gender" value="Perempuan" checked={formData.victim_gender === 'Perempuan'} onChange={handleInputChange} className={styles.radioInput} />
                                                <span className="text-sm font-medium text-gray-700">Perempuan</span>
                                            </label>
                                        </div>
                                        {formErrors.victim_gender && <span className={styles.errorText}>{formErrors.victim_gender}</span>}
                                    </div>
                                </div>
                            </section>

                            {/* SECTION 4: INFORMASI TERLAPOR */}
                            <section className={styles.section}>
                                <h2 className={styles.sectionTitle}>
                                    <Shield size={20} strokeWidth={1.8} className="text-rose-500" />
                                    Informasi Terlapor (Pelaku)
                                </h2>
                                <p className={styles.sectionDesc}>Data terduga pelaku dari lingkungan Politeknik Negeri Jember.</p>

                                <div className={styles.formGrid}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Nama Terlapor <span className="text-gray-400 text-xs ml-1">(Inisial jika tidak tahu)</span></label>
                                        <input
                                            type="text" name="suspect_name"
                                            className={styles.input}
                                            placeholder="Nama lengkap/inisial pelaku"
                                            value={formData.suspect_name} onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Jenis Kelamin Terlapor</label>
                                        <div className={styles.radioGroup}>
                                            <label className={`${styles.radioLabel} ${formData.suspect_gender === 'Laki-laki' ? styles.radioLabelActive : ''}`}>
                                                <input type="radio" name="suspect_gender" value="Laki-laki" checked={formData.suspect_gender === 'Laki-laki'} onChange={handleInputChange} className={styles.radioInput} />
                                                <span className="text-sm font-medium text-gray-700">Laki-laki</span>
                                            </label>
                                            <label className={`${styles.radioLabel} ${formData.suspect_gender === 'Perempuan' ? styles.radioLabelActive : ''}`}>
                                                <input type="radio" name="suspect_gender" value="Perempuan" checked={formData.suspect_gender === 'Perempuan'} onChange={handleInputChange} className={styles.radioInput} />
                                                <span className="text-sm font-medium text-gray-700">Perempuan</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Status Terlapor</label>
                                        <select
                                            name="suspect_status"
                                            className={styles.select}
                                            value={formData.suspect_status} onChange={handleInputChange}
                                        >
                                            <option value="">Pilih Status</option>
                                            <option value="Mahasiswa">Mahasiswa</option>
                                            <option value="Dosen">Dosen</option>
                                            <option value="Tenaga Pendidik">Tenaga Pendidik</option>
                                            <option value="Pihak Luar">Pihak Luar</option>
                                        </select>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Afiliasi/Bagian Terlapor</label>
                                        <input
                                            type="text" name="suspect_affiliation"
                                            className={styles.input}
                                            placeholder="Contoh: Jurusan Teknologi Informasi"
                                            value={formData.suspect_affiliation} onChange={handleInputChange}
                                        />
                                    </div>
                                </div>
                            </section>

                             {/* SECTION 5: JADWAL KONSULTASI */}
                            <section className={styles.section}>
                                <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-white -mx-8 -mt-8 mb-8">
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                        <Calendar className="w-6 h-6 mr-3 text-purple-600" /> Usulan Jadwal Penanganan
                                    </h2>
                                    <p className="text-xs text-gray-500 mt-1">Kapan Anda bersedia untuk berdiskusi lebih lanjut dengan Tim Satgas?</p>
                                </div>

                                <div className="bg-amber-50 border border-amber-200 rounded-[2rem] p-6 mb-8 flex items-start gap-4">
                                    <Info className="w-6 h-6 text-amber-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-bold text-amber-900 mb-1">Ketentuan Jadwal Penanganan:</p>
                                        <ul className="text-[11px] text-amber-800 space-y-1 font-medium">
                                            <li className="flex items-center gap-2">• Tersedia hari <span className="font-bold underline decoration-amber-400">Senin - Kamis</span></li>
                                            <li className="flex items-center gap-2">• Jam operasional <span className="font-bold underline decoration-amber-400">08:00 - 16:00 WIB</span></li>
                                            <li className="flex items-center gap-2">• Jumat - Minggu hanya untuk pengiriman laporan (tanpa jadwal langsung)</li>
                                        </ul>
                                    </div>
                                </div>

                                <div className={styles.formGrid}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Pilih Tanggal Pertemuan <span className={styles.required}>*</span></label>
                                        <input
                                            type="date" required
                                            min={new Date().toISOString().split('T')[0]}
                                            className={`${styles.input} ${scheduleWarning ? 'border-amber-400 bg-amber-50' : ''}`}
                                            value={proposedDate} onChange={(e) => setProposedDate(e.target.value)}
                                        />
                                        {scheduleWarning && (
                                            <div className="mt-3 p-3 bg-amber-100 border border-amber-200 rounded-xl flex items-start gap-2 text-amber-800 animate-in fade-in slide-in-from-top-1">
                                                <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                                                <p className="text-[10px] font-bold leading-tight">{scheduleWarning}</p>
                                            </div>
                                        )}
                                        {formErrors.proposed_date && <span className={styles.errorText}>{formErrors.proposed_date}</span>}
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Pilih Jam Pertemuan (08:00 - 16:00) <span className={styles.required}>*</span></label>
                                        <select 
                                            required
                                            className={styles.select}
                                            value={proposedTime}
                                            onChange={(e) => setProposedTime(e.target.value)}
                                        >
                                            {['08','09','10','11','12','13','14','15','16'].map(h => (
                                                <React.Fragment key={h}>
                                                    <option value={`${h}:00`}>{h}:00 WIB</option>
                                                    <option value={`${h}:30`}>{h}:30 WIB</option>
                                                </React.Fragment>
                                            ))}
                                        </select>
                                        {formErrors.proposed_time && <span className={styles.errorText}>{formErrors.proposed_time}</span>}
                                    </div>
                                </div>
                            </section>

                            {/* SECTION 6: DETAIL KEJADIAN */}
                            <section className={styles.section}>
                                <h2 className={styles.sectionTitle}>
                                    <AlertCircle size={20} strokeWidth={1.8} className="text-amber-500" />
                                    Detail Kejadian (Kronologi)
                                </h2>
                                <p className={styles.sectionDesc}>Jelaskan kejadian secara rinci untuk mempermudah penanganan.</p>

                                <div className={styles.formGrid}>
                                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                        <label className={styles.label}>Ringkasan Singkat <span className={styles.required}>*</span></label>
                                        <textarea
                                            name="description" required
                                            className={styles.textarea}
                                            placeholder="Garis besar kejadian dalam 1-2 kalimat."
                                            value={formData.description} onChange={handleInputChange}
                                        ></textarea>
                                        {formErrors.description && <span className={styles.errorText}>{formErrors.description}</span>}
                                    </div>

                                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                        <label className={styles.label}>Kronologi Lengkap <span className={styles.required}>*</span></label>
                                        <textarea
                                            name="chronology" required
                                            className={styles.textarea} style={{ minHeight: '180px' }}
                                            placeholder="Ceritakan urutan kejadian secara mendalam..."
                                            value={formData.chronology} onChange={handleInputChange}
                                        ></textarea>
                                        {formErrors.chronology && <span className={styles.errorText}>{formErrors.chronology}</span>}
                                    </div>

                                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                        <label className={styles.label}>Lokasi Kejadian <span className={styles.required}>*</span></label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-3 text-gray-400">
                                                <MapPin size={18} />
                                            </span>
                                            <input
                                                type="text" name="location" required
                                                className={styles.input} style={{ paddingLeft: '36px' }}
                                                placeholder="Contoh: Lobby Gedung JTI"
                                                value={formData.location} onChange={handleInputChange}
                                            />
                                        </div>
                                        {formErrors.location && <span className={styles.errorText}>{formErrors.location}</span>}
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Latitude <span className="text-gray-400 text-xs ml-1">(Opsional)</span></label>
                                        <input
                                            type="number" step="any" name="latitude"
                                            className={styles.input}
                                            placeholder="-8.xxx"
                                            value={formData.latitude} onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Longitude <span className="text-gray-400 text-xs ml-1">(Opsional)</span></label>
                                        <input
                                            type="number" step="any" name="longitude"
                                            className={styles.input}
                                            placeholder="113.xxx"
                                            value={formData.longitude} onChange={handleInputChange}
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* SECTION 7: LAMPIRAN */}
                            <section className={styles.section}>
                                <h2 className={styles.sectionTitle}>
                                    <Paperclip size={20} strokeWidth={1.8} className="text-gray-500" />
                                    Lampiran Bukti (Opsional)
                                </h2>
                                <p className={styles.sectionDesc}>Unggah foto, screenshot, atau dokumen pendukung lainnya (JPG/PNG/PDF).</p>

                                <div className="mt-4">
                                    <div className="relative border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:bg-gray-50 transition-all group">
                                        <input
                                            type="file" multiple accept=".jpg,.jpeg,.png,.pdf"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            onChange={handleFileChange}
                                        />
                                        <div className="flex flex-col items-center">
                                            <Paperclip className="w-10 h-10 text-gray-400 group-hover:text-purple-500 transition-colors mb-2" />
                                            <p className="text-sm font-medium text-gray-600">Klik atau seret file ke sini</p>
                                            <p className="text-xs text-gray-400 mt-1">Maksimal total file 10MB</p>
                                        </div>
                                    </div>

                                    {formData.attachments.length > 0 && (
                                        <div className="mt-6 space-y-2">
                                            {formData.attachments.map((file, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 shadow-sm animate-in slide-in-from-left-2 duration-300">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
                                                            <FileText size={20} />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-semibold text-gray-800 truncate max-w-[200px]">{file.name}</p>
                                                            <p className="text-[10px] text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                                        </div>
                                                    </div>
                                                    <button 
                                                        type="button" 
                                                        onClick={() => removeAttachment(idx)}
                                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </section>

                            <button type="submit" className={styles.submitButton} disabled={loading}>
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <Clock className="animate-spin" size={18} /> Memproses Laporan...
                                    </span>
                                ) : (
                                    <>Kirim Laporan Pengaduan <Send size={18} /></>
                                )}
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
