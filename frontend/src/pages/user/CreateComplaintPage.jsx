import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, User, MapPin, AlertCircle, ArrowLeft, Send, CheckCircle, Shield, Clock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import UserLayout from '../../components/user/UserLayout';
import styles from './CreateComplaintPage.module.css';

import { API_BASE_URL } from '../../config';

const CreateComplaintPage = () => {
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        violence_category_id: '',
        urgency_level: 'low',
        victim_type: 'self',
        victim_name: '',
        victim_gender: currentUser?.gender || '',
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
        longitude: ''
    });

    const [formErrors, setFormErrors] = useState({});
    const [reportId, setReportId] = useState('');
    
    useEffect(() => {
        // Enforce profile completion before allowing report creation
        const isProfileIncomplete = currentUser?.role === 'user' && (!currentUser?.gender || !currentUser?.unit || !currentUser?.name);
        
        if (isProfileIncomplete) {
            navigate('/profile', { replace: true });
        }
    }, [currentUser, navigate]);

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            'Content-Type': 'application/json'
        };
    };

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/user/categories`, {
                    method: 'GET',
                    headers: getAuthHeaders(),
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
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Hapus pesan error di field tersebut jika mulai ngetik lagi
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.title.trim()) errors.title = 'Judul laporan wajib diisi';
        if (!formData.violence_category_id) errors.violence_category_id = 'Kategori wajib dipilih';
        if (!formData.description.trim()) errors.description = 'Deskripsi singkat wajib diisi';
        if (!formData.chronology.trim()) errors.chronology = 'Kronologi kejadian wajib diisi';
        if (!formData.location.trim()) errors.location = 'Lokasi kejadian wajib diisi';

        if (formData.victim_type === 'other') {
            if (!formData.victim_name.trim()) errors.victim_name = 'Nama korban wajib diisi';
            if (!formData.victim_gender) errors.victim_gender = 'Jenis kelamin korban wajib dipilih';
            if (!formData.victim_relationship.trim()) errors.victim_relationship = 'Hubungan dengan korban wajib diisi';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        setSubmitError('');

        try {
            const finalData = {
                ...formData,
                victim_gender: formData.victim_type === 'self' ? currentUser?.gender : formData.victim_gender
            };

            const response = await fetch(`${API_BASE_URL}/user/reports`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(finalData),
            });

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                const errorMessage = data?.message || data?.error || 'Terjadi kesalahan pada server saat menyimpan formulir.';
                throw new Error(errorMessage);
            }

            if (data?.data?.report_id) {
                setReportId(data.data.report_id);
            }

            setSuccess(true);
            // window.scrollTo(0, 0); // Optional: scroll to top to see success message
        } catch (err) {
            console.error('Submit form error:', err);
            setSubmitError(err.message || 'Gagal mengirim laporan. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate('/user/dashboard');
    };

    return (
        <UserLayout user={currentUser}>
            <div className={styles.page}>

                <header className={styles.header}>
                    <button type="button" className={styles.backButton} onClick={handleBack}>
                        <ArrowLeft size={20} strokeWidth={1.8} />
                        Kembali
                    </button>
                    <div>
                        <h1 className={styles.title}>📝 Buat Pengaduan Baru</h1>
                        <p className="opacity-90 mt-2 mb-4 text-gray-500">Isi formulir berikut dengan jujur. Identitas Anda akan dijaga kerahasiaannya oleh Tim Satgas.</p>
                    </div>
                </header>

                <div className={styles.tipsContainer}>
                    <div className={`${styles.tipCard} ${styles.blue}`}>
                        <h4 className={`${styles.tipTitle} ${styles.blue}`}><Shield size={14} /> Keamanan Data</h4>
                        <p className={`${styles.tipDesc} ${styles.blue}`}>Identitas pelapor dijamin aman dan rahasia oleh Tim Satgas.</p>
                    </div>
                    <div className={`${styles.tipCard} ${styles.rose}`}>
                        <h4 className={`${styles.tipTitle} ${styles.rose}`}><FileText size={14} /> Bukti Kejadian</h4>
                        <p className={`${styles.tipDesc} ${styles.rose}`}>Lampirkan bukti foto/dokumen untuk mempermudah proses.</p>
                    </div>
                    <div className={`${styles.tipCard} ${styles.amber}`}>
                        <h4 className={`${styles.tipTitle} ${styles.amber}`}><Clock size={14} /> Respon Cepat</h4>
                        <p className={`${styles.tipDesc} ${styles.amber}`}>Satgas akan segera meninjau laporan Anda di dashboard.</p>
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
                            <strong>Pesan untuk Satgas:</strong><br/>
                            "Halo Tim Satgas PPKPT PolijeCare, saya telah membuat laporan pengaduan yang memerlukan tindak lanjut segera. Mohon bantuannya untuk meninjau laporan saya dengan nomor registrasi <strong>{reportId}</strong>. Terima kasih."
                          </p>
                        </div>
                        <p className="text-gray-500 text-sm mb-8">
                          Nomor Registrasi Anda: <span className="font-bold text-emerald-600">{reportId}</span><br/>
                          Tim Satgas akan segera meninjau laporan Anda. Mohon pantau histori pengaduan secara berkala.
                        </p>
                        <button 
                          onClick={() => navigate('/user/histori-pengaduan')}
                          className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20"
                        >
                          Lihat Histori Pengaduan
                        </button>
                    </div>
                ) : (
                <form onSubmit={handleSubmit} className={styles.content}>

                    {/* SECTION 1: INFORMARSI LAPORAN */}
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>
                            <FileText size={20} strokeWidth={1.8} />
                            Informasi Laporan
                        </h2>
                        <p className={styles.sectionDesc}>Berikan judul yang jelas dan pilih kategori kekerasan yang sesuai dengan kejadian.</p>

                        <div className={styles.formGrid}>
                            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                <label className={styles.label}>Judul Laporan <span className={styles.required}>*</span></label>
                                <input
                                    type="text" name="title"
                                    className={styles.input}
                                    placeholder="Contoh: Pelecehan Verbal di Ruang Dosen"
                                    value={formData.title} onChange={handleInputChange}
                                />
                                {formErrors.title && <span className={styles.errorText}>{formErrors.title}</span>}
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Kategori Kekerasan <span className={styles.required}>*</span></label>
                                <select
                                    name="violence_category_id"
                                    className={styles.select}
                                    value={formData.violence_category_id} onChange={handleInputChange}
                                >
                                    <option value="">Pilih Kategori</option>
                                    {categories.map((cat, idx) => (
                                        <option key={cat.unique_id || cat.id || idx} value={cat.unique_id || cat.id}>
                                            {cat.name || cat.kategori || cat.title}
                                        </option>
                                    ))}
                                </select>
                                {formErrors.violence_category_id && <span className={styles.errorText}>{formErrors.violence_category_id}</span>}
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Tingkat Urgensi <span className={styles.required}>*</span></label>
                                <select
                                    name="urgency_level"
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

                    {/* SECTION 2: INFORMASI KORBAN (PELAPOR/ORANG LAIN) */}
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>
                            <User size={20} strokeWidth={1.8} />
                            Informasi Korban (Pelapor)
                        </h2>
                        <p className={styles.sectionDesc}>Data Pelapor adalah orang yang melaporkan kejadian (bisa diri Anda sendiri sebagai korban, atau orang lain yang melihat kejadian).</p>

                        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                            <label className={styles.label}>Siapa korbannya? <span className={styles.required}>*</span></label>
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
                                        <span className="text-[11px] text-gray-500">Melaporkan teman/orang lain</span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {formData.victim_type === 'other' && (
                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Nama Korban <span className={styles.required}>*</span></label>
                                    <input
                                        type="text" name="victim_name"
                                        className={styles.input}
                                        placeholder="Nama korban yang bersangkutan"
                                        value={formData.victim_name} onChange={handleInputChange}
                                    />
                                    {formErrors.victim_name && <span className={styles.errorText}>{formErrors.victim_name}</span>}
                                </div>

                            </div>
                        )}

                        <div className={styles.formGrid}>
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

                    {/* SECTION 2.5: INFORMASI TERLAPOR */}
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>
                            <Shield size={20} strokeWidth={1.8} className="text-rose-500" />
                            Informasi Terlapor
                        </h2>
                        <p className={styles.sectionDesc}>Data Terlapor adalah orang yang diadukan atau diduga melakukan tindakan kekerasan/perundungan.</p>

                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Nama Terlapor <span className="text-gray-400 text-xs ml-1">(Boleh inisial jika tidak tahu)</span></label>
                                <input
                                    type="text" name="suspect_name"
                                    className={styles.input}
                                    placeholder="Nama terduga pelaku"
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
                                <label className={styles.label}>Status/Afiliasi Terlapor</label>
                                <select
                                    name="suspect_status"
                                    className={styles.select}
                                    value={formData.suspect_status} onChange={handleInputChange}
                                >
                                    <option value="">Pilih Status</option>
                                    <option value="mahasiswa">Mahasiswa</option>
                                    <option value="dosen">Dosen</option>
                                    <option value="tendik">Tenaga Kependidikan (Tendik)</option>
                                    <option value="teknisi">Teknisi / Staff Lapangan</option>
                                    <option value="ob">Office Boy (OB) / Kebersihan</option>
                                    <option value="security">Satpam / Security</option>
                                    <option value="lainnya">Lainnya / Luar Kampus</option>
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Unit/Instansi Terlapor</label>
                                <input
                                    type="text" name="suspect_affiliation"
                                    className={styles.input}
                                    placeholder="Contoh: Prodi TIF / Gedung Rektorat"
                                    value={formData.suspect_affiliation} onChange={handleInputChange}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Nomor Telp Terlapor <span className="text-gray-400 text-xs ml-1">(opsional)</span></label>
                                <input
                                    type="text" name="suspect_phone"
                                    className={styles.input}
                                    placeholder="Jika tahu nomor WA/Telp"
                                    value={formData.suspect_phone} onChange={handleInputChange}
                                />
                            </div>
                        </div>
                    </section>

                    {/* SECTION 3: DETAIL PENGADUAN */}
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>
                            <AlertCircle size={20} strokeWidth={1.8} className="text-amber-500" />
                            Detail Kejadian (Kronologi)
                        </h2>
                        <p className={styles.sectionDesc}>Kronologi adalah urutan kejadian yang menjelaskan bagaimana peristiwa tersebut berlangsung dari awal hingga akhir secara detail.</p>

                        <div className={styles.formGrid}>
                            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                <label className={styles.label}>Ringkasan Kejadian <span className={styles.required}>*</span></label>
                                <textarea
                                    name="description"
                                    className={styles.textarea}
                                    placeholder="Tuliskan ringkasan apa yang terjadi dalam satu paragraf."
                                    value={formData.description} onChange={handleInputChange}
                                ></textarea>
                                {formErrors.description && <span className={styles.errorText}>{formErrors.description}</span>}
                            </div>

                            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                <div className="flex justify-between items-end mb-2">
                                  <label className={styles.label}>Kronologi Lengkap <span className={styles.required}>*</span></label>
                                  <span className="text-[10px] text-gray-400 italic">Jelaskan: Kapan, Dimana, Siapa saja yang terlibat, dan Bagaimana kejadiannya.</span>
                                </div>
                                <textarea
                                    name="chronology"
                                    className={styles.textarea} style={{ minHeight: '200px' }}
                                    placeholder="Jelaskan urutan kejadian secara detail.
Contoh:
1. Pukul 10.00 saya berada di...
2. Terlapor mendatangi saya dan...
3. Saya merasa terganggu karena..."
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
                                        type="text" name="location"
                                        className={styles.input} style={{ paddingLeft: '36px' }}
                                        placeholder="Contoh: Depan Gedung Rektorat / Kantin Jurusan"
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

                    <button type="submit" className={styles.submitButton} disabled={loading}>
                        {loading ? (
                            <span>Memproses Laporan...</span>
                        ) : (
                            <>Kirim Pengaduan Ke Satgas <Send size={18} /></>
                        )}
                    </button>
                </form>
                )}

            </div>
        </UserLayout>
    );
};

export default CreateComplaintPage;
